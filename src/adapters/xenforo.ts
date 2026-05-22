import { customError, delay } from '@/utils/helpers'
import { withDomain, parseHTMLDocument, removePostNumber } from '@/utils/url'

import type { ProgressData, StoryResult } from '@/types'

async function getXenForoData(
  adapterName: string,
  baseURL: string,
  userUrl: string,
  progressCallback: (progress: ProgressData) => void,
): Promise<StoryResult[]> {
  const data: StoryResult[] = []

  const getDocument = async (url: string) => {
    const response = await fetch(url, {
      mode: 'cors',
      credentials: 'include',
      headers: { 'User-Agent': navigator.userAgent },
    })
    const html = await response.text()
    const document = parseHTMLDocument(html)

    if (response.status === 403 || response.status === 401) {
      const blockMessage = document
        .querySelector('.blockMessage')
        ?.textContent?.trim()

      if (blockMessage === "This user's profile is not available.") {
        customError(adapterName, blockMessage)
      } else {
        customError(adapterName, "User isn't logged in")
      }
    }

    const baseTag = document.createElement('base')
    baseTag.href = baseURL
    document.head.prepend(baseTag)

    return document
  }

  async function collectPaginatedResults(
    cprAdapterName: string,
    cprBaseURL: string,
    initialUrl: string,
    cprData: StoryResult[],
    cprProgressCallback: (progress: ProgressData) => void,
    segmentIndex: number = 0,
    pageOffset: number = 0,
  ): Promise<void> {
    const sendLog = (
      level: 'debug' | 'info' | 'warn' | 'error',
      message: string,
    ) => {
      // Still log to actual console for dev debugging
      if (level === 'debug' || level === 'info')
        console.log(`[${cprAdapterName}] ${message}`)
      else if (level === 'warn') console.warn(`[${cprAdapterName}] ${message}`)
      else console.error(`[${cprAdapterName}] ${message}`)

      // Since sendLog only knows static data most of the time, we emit a zero payload
      // and intercept it in react so IT DOES NOT OVERRIDE the real page progress numbers.
      cprProgressCallback({
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
      'debug',
      segmentIndex === 0
        ? `Initiating search for user content…\nURL: ${initialUrl}`
        : `Fetching next block of older results…\nURL: ${initialUrl}`,
    )

    const firstPageDoc = await getDocument(initialUrl)

    const nav = firstPageDoc.querySelector('nav.pageNavWrapper ul.pageNav-main')
    const sampleLink = nav?.querySelector(
      "a[href*='page=']",
    ) as HTMLAnchorElement | null
    const sampleHref = sampleLink?.getAttribute('href') || ''
    const last = nav?.lastElementChild?.textContent
    const totalPages = sampleLink ? parseInt(last ?? '1', 10) : 1

    const urlTemplate = sampleHref
      ? new URL(withDomain(cprBaseURL, sampleHref))
      : new URL(initialUrl)

    const basePath = urlTemplate.origin + urlTemplate.pathname
    const baseParams = urlTemplate.searchParams
    const pageParamName = 'page'

    for (let pageNo = 1; pageNo <= totalPages; pageNo++) {
      try {
        const params = new URLSearchParams(baseParams)
        params.set(pageParamName, String(pageNo))
        const pageUrl = `${basePath}?${params.toString()}`

        const doc = await getDocument(pageUrl)

        const blockMessages = Array.from(
          doc.querySelectorAll('.blockMessage'),
        ) as HTMLElement[]

        const trimmedMessages = blockMessages.map(
          (el) => el.textContent?.trim() ?? '',
        )

        // Case: new profile, no content ever
        if (
          trimmedMessages.some((msg) =>
            /has not posted any content recently\.$/i.test(msg),
          )
        ) {
          sendLog(
            'info',
            "This user hasn't posted any content recently. No stories to extract.",
          )
          return
        }

        const ol: HTMLOListElement | null = doc.querySelector('ol.block-body')

        // Case: this page has no results (end of "view older results" segment)
        if (
          trimmedMessages.length === 1 &&
          trimmedMessages[0] === 'No results found.' &&
          !ol
        ) {
          sendLog(
            'info',
            "No results found on this page. Reached the end of the user's content.",
          )
          return
        }

        if (!ol) {
          customError(cprAdapterName, "There's no data for this link")
        }

        const liArray = Array.from(ol.children) as HTMLLIElement[]
        liArray.forEach((li) => {
          const anchor = li.querySelector(
            '.contentRow-main h3.contentRow-title > a',
          ) as HTMLAnchorElement
          if (
            !anchor?.textContent ||
            !anchor.href ||
            anchor.href.includes('/profile-posts/')
          )
            return

          const title = anchor.textContent.trim()
          const href = removePostNumber(withDomain(cprBaseURL, anchor.href))
          const existingStoryResult = cprData.find((d) => d.title === title)
          if (existingStoryResult) {
            existingStoryResult.count++
          } else {
            const newStoryResult: StoryResult = { title, link: href, count: 1 }
            cprData.push(newStoryResult)
          }
        })

        cprProgressCallback({
          page: pageOffset + pageNo,
          totalPages: pageOffset + totalPages,
          found: cprData.length,
        })
        sendLog(
          'info',
          `Successfully parsed page ${pageNo} of ${totalPages}. Total unique threads discovered: ${cprData.length}.`,
        )

        // Only delay if there are more pages ahead
        if (pageNo < totalPages) {
          await delay(4000)
        }

        // Check for "View older results" *on the last page*
        if (pageNo === totalPages) {
          const viewOlder = ol.nextElementSibling?.querySelector(
            'a.button--link.button',
          ) as HTMLAnchorElement | null
          if (viewOlder?.href) {
            const nextURL = withDomain(cprBaseURL, viewOlder.href)
            const nextOffset = pageOffset + totalPages

            if (segmentIndex > 10) {
              sendLog(
                'error',
                "Exceeded maximum 'older results' segments. Aborting to prevent infinite loop.",
              )
              customError(
                cprAdapterName,
                "Too many 'older results' segments. Aborting to prevent infinite loop.",
              )
            }

            await delay(4000)

            await collectPaginatedResults(
              cprAdapterName,
              cprBaseURL,
              nextURL,
              cprData,
              cprProgressCallback,
              segmentIndex + 1,
              nextOffset,
            )
          }
        }
      } catch (error) {
        sendLog(
          'warn',
          `Error encountered while parsing page ${pageNo}. Skipping this page. Details: ${error instanceof Error ? error.message : String(error)}`,
        )
        continue
      }
    }
  }

  try {
    const firstLink = withDomain(baseURL, userUrl)

    console.log('🔍 Scraping started for:', firstLink)

    const profileDoc = await getDocument(firstLink)

    const link = profileDoc.querySelector(
      'a.menu-linkRow[href^="/search/member?user_id="]',
    ) as HTMLAnchorElement | null

    if (!link) {
      customError(adapterName, 'Could not find user content link')
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
