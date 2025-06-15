import type { ProgressData, storyObject } from "@/types"
import { customError, delay, getPaginatedSearchUrl, withDomain } from "@/utils"
import { parseHTML } from "linkedom"

async function getXenForoData(
  adapterName: string,
  baseURL: string,
  userUrl: string,
  progressCallback?: (progress: ProgressData) => void
): Promise<storyObject[]> {
  const data: storyObject[] = []

  const getDocument = async (url: string) => {
    const response = await fetch(url, {
      mode: "cors",
      credentials: "include",
      headers: { "User-Agent": navigator.userAgent }
    })

    if (response.status === 403 || response.status === 401) {
      customError(adapterName, "User isn't logged in")
    }

    const html = await response.text()
    return parseHTML(html).document
  }

  const profileDoc = await getDocument(userUrl)

  const link = profileDoc.querySelector(
    'a.menu-linkRow[href^="/search/member?user_id="]'
  ) as HTMLAnchorElement | null

  if (!link) {
    customError(adapterName, "Could not find user content link")
  }

  const pageUrl = link.href.startsWith("/")
    ? withDomain(baseURL, link.href)
    : link.href

  try {
    const firstPageDoc = await getDocument(pageUrl)

    const nav = firstPageDoc.querySelector("nav.pageNavWrapper ul.pageNav-main")
    const last = nav?.lastElementChild?.textContent
    const totalPages = parseInt(last ?? "1", 10)

    const sampleLink = nav?.querySelector(
      "a[href*='page=']"
    ) as HTMLAnchorElement | null
    const sampleHref = sampleLink?.getAttribute("href") || ""

    const urlTemplate = sampleHref
      ? new URL(withDomain(baseURL, sampleHref))
      : new URL(pageUrl)

    const basePath = urlTemplate.origin + urlTemplate.pathname
    const baseParams = urlTemplate.searchParams
    const pageParamName = "page"

    const urls: string[] = []

    for (let i = 1; i <= totalPages; i++) {
      const params = new URLSearchParams(baseParams)
      params.set(pageParamName, String(i))
      urls.push(`${basePath}?${params.toString()}`)
    }

    for (let pageNo = 1; pageNo <= urls.length; pageNo++) {
      try {
        const doc = await getDocument(urls[pageNo - 1])
        const ol: HTMLOListElement | null = doc.querySelector("ol.block-body")

        if (!ol) {
          customError(adapterName, "There's no data for this site")
        }

        const liArray = Array.from(ol.children) as HTMLLIElement[]
        liArray.forEach((li) => {
          const anchor = li.querySelector(
            ".contentRow-main h3.contentRow-title > a"
          ) as HTMLAnchorElement

          if (
            !anchor?.textContent ||
            !anchor.href ||
            anchor.href.startsWith("/profile-posts/")
          )
            return

          const title = anchor.textContent?.trim()
          const href = withDomain(baseURL, anchor.href)

          const existing = data.find((d) => d.title === title)

          if (existing) {
            existing.count++
          } else {
            data.push({
              title: title,
              link: href,
              count: 1
            })
          }
        })

        if (progressCallback) {
          progressCallback({ page: pageNo, totalPages, found: data.length })
        }

        if (pageNo < totalPages) {
          await delay(4000)
        }
      } catch (error) {
        customError(
          adapterName,
          `Failed to fetch data from page ${pageNo}`,
          error
        )
      }
    }

    return data
  } catch (error) {
    customError(adapterName, "An error occurred while fetching data", error)
  }
}

export default getXenForoData
