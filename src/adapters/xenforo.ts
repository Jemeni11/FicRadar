import type { ProgressData, StoryResult } from "@/types"
import { customError, delay, withDomain } from "@/utils"

function parseHTMLDocument(html: string): Document {
  return new DOMParser().parseFromString(html, "text/html")
}

// Remove everything after the last slash if it starts with "post-"
function removePostNumber(url: string): string {
  const urlObj = new URL(url)
  const pathParts = urlObj.pathname.split("/")
  if (pathParts[pathParts.length - 1].startsWith("post-")) {
    pathParts.pop()
    urlObj.pathname = pathParts.join("/")
  }
  return urlObj.toString()
}

async function getXenForoData(
  adapterName: string,
  baseURL: string,
  userUrl: string,
  progressCallback: (progress: ProgressData) => void,
): Promise<StoryResult[]> {
  const data: StoryResult[] = []

  const getDocument = async (url: string) => {
    const response = await fetch(url, {
      mode: "cors",
      credentials: "include",
      headers: { "User-Agent": navigator.userAgent },
    })
    const html = await response.text()
    const document = parseHTMLDocument(html)

    if (response.status === 403 || response.status === 401) {
      const blockMessage = document
        .querySelector(".blockMessage")
        ?.textContent?.trim()

      if (blockMessage === "This user's profile is not available.") {
        customError(adapterName, blockMessage)
      } else {
        customError(adapterName, "User isn't logged in")
      }
    }

    const baseTag = document.createElement("base")
    baseTag.href = baseURL
    document.head.prepend(baseTag)

    return document
  }

  async function collectPaginatedResults(
    adapterName: string,
    baseURL: string,
    initialUrl: string,
    data: StoryResult[],
    progressCallback: (progress: ProgressData) => void,
    segmentIndex: number = 0,
    pageOffset: number = 0,
  ): Promise<number> {
    const sendLog = (
      level: "debug" | "info" | "warn" | "error",
      message: string,
    ) => {
      // Still log to actual console for dev debugging
      if (level === "debug" || level === "info")
        console.log(`[${adapterName}] ${message}`)
      else if (level === "warn") console.warn(`[${adapterName}] ${message}`)
      else console.error(`[${adapterName}] ${message}`)

      // Since sendLog only knows static data most of the time, we emit a zero payload
      // and intercept it in react so IT DOES NOT OVERRIDE the real page progress numbers.
      progressCallback({
        page: -1,
        totalPages: -1,
        found: -1,
        logEntry: {
          timestamp: new Date().toISOString(),
          level,
          message,
        },
      })
    }

    sendLog(
      "debug",
      segmentIndex === 0
        ? `Initiating search for user content…\nURL: ${initialUrl}`
        : `Fetching next block of older results…\nURL: ${initialUrl}`,
    )

    const firstPageDoc = await getDocument(initialUrl)

    const nav = firstPageDoc.querySelector("nav.pageNavWrapper ul.pageNav-main")
    const sampleLink = nav?.querySelector(
      "a[href*='page=']",
    ) as HTMLAnchorElement | null
    const sampleHref = sampleLink?.getAttribute("href") || ""
    const last = nav?.lastElementChild?.textContent
    const totalPages = sampleLink ? parseInt(last ?? "1", 10) : 1

    const urlTemplate = sampleHref
      ? new URL(withDomain(baseURL, sampleHref))
      : new URL(initialUrl)

    const basePath = urlTemplate.origin + urlTemplate.pathname
    const baseParams = urlTemplate.searchParams
    const pageParamName = "page"

    for (let pageNo = 1; pageNo <= totalPages; pageNo++) {
      try {
        const params = new URLSearchParams(baseParams)
        params.set(pageParamName, String(pageNo))
        const pageUrl = `${basePath}?${params.toString()}`

        const doc = await getDocument(pageUrl)

        const blockMessages = Array.from(
          doc.querySelectorAll(".blockMessage"),
        ) as HTMLElement[]

        const trimmedMessages = blockMessages.map(
          (el) => el.textContent?.trim() ?? "",
        )

        // Case: new profile, no content ever
        if (
          trimmedMessages.some((msg) =>
            /has not posted any content recently\.$/i.test(msg),
          )
        ) {
          sendLog(
            "info",
            "This user hasn't posted any content recently. No stories to extract.",
          )
          return
        }

        const ol: HTMLOListElement | null = doc.querySelector("ol.block-body")

        // Case: this page has no results (end of "view older results" segment)
        if (
          trimmedMessages.length === 1 &&
          trimmedMessages[0] === "No results found." &&
          !ol
        ) {
          sendLog(
            "info",
            "No results found on this page. Reached the end of the user's content.",
          )
          return
        }

        if (!ol) {
          customError(adapterName, "There's no data for this link")
        }

        const liArray = Array.from(ol.children) as HTMLLIElement[]
        liArray.forEach((li) => {
          const anchor = li.querySelector(
            ".contentRow-main h3.contentRow-title > a",
          ) as HTMLAnchorElement
          if (
            !anchor?.textContent ||
            !anchor.href ||
            anchor.href.includes("/profile-posts/")
          )
            return

          const title = anchor.textContent.trim()
          const href = removePostNumber(withDomain(baseURL, anchor.href))
          const existing = data.find((d) => d.title === title)
          existing
            ? existing.count++
            : data.push({ title, link: href, count: 1 })
        })

        progressCallback({
          page: pageOffset + pageNo,
          totalPages: pageOffset + totalPages,
          found: data.length,
        })
        sendLog(
          "info",
          `Successfully parsed page ${pageNo} of ${totalPages}. Total unique threads discovered: ${data.length}.`,
        )

        // Only delay if there are more pages ahead
        if (pageNo < totalPages) {
          await delay(4000)
        }

        // Check for "View older results" *on the last page*
        if (pageNo === totalPages) {
          const viewOlder = ol.nextElementSibling?.querySelector(
            "a.button--link.button",
          ) as HTMLAnchorElement | null
          if (viewOlder?.href) {
            const nextURL = withDomain(baseURL, viewOlder.href)
            const nextOffset = pageOffset + totalPages

            if (segmentIndex > 10) {
              sendLog(
                "error",
                "Exceeded maximum 'older results' segments. Aborting to prevent infinite loop.",
              )
              customError(
                adapterName,
                "Too many 'older results' segments. Aborting to prevent infinite loop.",
              )
            }

            await delay(4000)

            await collectPaginatedResults(
              adapterName,
              baseURL,
              nextURL,
              data,
              progressCallback,
              segmentIndex + 1,
              nextOffset,
            )
          }
        }
      } catch (error) {
        sendLog(
          "warn",
          `Error encountered while parsing page ${pageNo}. Skipping this page. Details: ${error}`,
        )
        continue
      }
    }

    return pageOffset + totalPages
  }

  try {
    const firstLink = withDomain(baseURL, userUrl)

    console.log("🔍 Scraping started for:", firstLink)

    const profileDoc = await getDocument(firstLink)

    const link = profileDoc.querySelector(
      'a.menu-linkRow[href^="/search/member?user_id="]',
    ) as HTMLAnchorElement | null

    if (!link) {
      customError(adapterName, "Could not find user content link")
    }

    const pageUrl = link.href

    await collectPaginatedResults(
      adapterName,
      baseURL,
      pageUrl,
      data,
      progressCallback,
      0,
      0,
    )
  } catch (err) {
    console.warn(
      `[${adapterName}] Error during scrape. Returning partial results.`,
    )
    console.error(err)
  }

  return data
}

export default getXenForoData
