import type { ProgressData, StoryResult } from "@/types"
import { customError, delay, withDomain } from "@/utils"
import { parseHTML } from "linkedom"

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
  progressCallback?: (progress: ProgressData) => void,
): Promise<StoryResult[]> {
  const data: StoryResult[] = []

  const getDocument = async (url: string) => {
    const response = await fetch(url, {
      mode: "cors",
      credentials: "include",
      headers: { "User-Agent": navigator.userAgent },
    })
    const html = await response.text()
    const document = parseHTML(html).document

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

    return document
  }

  async function collectPaginatedResults(
    adapterName: string,
    baseURL: string,
    initialUrl: string,
    data: StoryResult[],
    progressCallback?: (progress: ProgressData) => void,
    segmentIndex: number = 0,
  ): Promise<void> {
    const firstPageDoc = await getDocument(initialUrl)

    const nav = firstPageDoc.querySelector("nav.pageNavWrapper ul.pageNav-main")
    const last = nav?.lastElementChild?.textContent
    const totalPages = parseInt(last ?? "1", 10)

    const sampleLink = nav?.querySelector(
      "a[href*='page=']",
    ) as HTMLAnchorElement | null
    const sampleHref = sampleLink?.getAttribute("href") || ""

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
        const ol: HTMLOListElement | null = doc.querySelector("ol.block-body")

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
            anchor.href.startsWith("/profile-posts/")
          )
            return

          const title = anchor.textContent.trim()
          const href = removePostNumber(withDomain(baseURL, anchor.href))
          const existing = data.find((d) => d.title === title)
          existing
            ? existing.count++
            : data.push({ title, link: href, count: 1 })
        })

        progressCallback?.({ page: pageNo, totalPages, found: data.length })

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
            if (segmentIndex > 10) {
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
            )
          }
        }
      } catch (error) {
        customError(
          adapterName,
          `Failed to fetch data from page ${pageNo}`,
          error,
        )
      }
    }
  }

  const profileDoc = await getDocument(userUrl)

  const link = profileDoc.querySelector(
    'a.menu-linkRow[href^="/search/member?user_id="]',
  ) as HTMLAnchorElement | null

  if (!link) {
    customError(adapterName, "Could not find user content link")
  }

  const pageUrl = link.href.startsWith("/")
    ? withDomain(baseURL, link.href)
    : link.href

  await collectPaginatedResults(
    adapterName,
    baseURL,
    pageUrl,
    data,
    progressCallback,
  )
  return data
}

export default getXenForoData
