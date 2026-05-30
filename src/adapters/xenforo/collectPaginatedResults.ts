import { customError, delay } from '@/utils/helpers'
import { withDomain, removePostNumber } from '@/utils/url'

import getDocument from './getDocument'

import type { ProgressData, StoryResult } from '@/types'

const isDev = import.meta.env.DEV

/**
 * Crawls a XenForo “all content” style paginated results set and aggregates
 * thread occurrences into a single StoryResult list.
 *
 * This handles:
 * - standard page-based pagination (?page=1..n)
 * - XenForo “View older results” chaining (multiple segments of history)
 * - duplicate thread aggregation across pages
 * - basic forum edge cases like empty profiles or blocked pages
 *
 * The result is a frequency map of thread titles → links → occurrence count.
 */
async function collectPaginatedResults(
  adapterName: string,
  baseURL: string,
  initialUrl: string,
  storyData: StoryResult[],
  progressCallback: (progress: ProgressData) => void,
  segmentIndex: number = 0,
  pageOffset: number = 0,
): Promise<void> {
  const sendLog = (
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
  ) => {
    if (isDev) {
      const prefixedMessage = `[${adapterName}] ${message}`
      if (level === 'debug' || level === 'info') {
        console.log(prefixedMessage)
      } else if (level === 'warn') {
        console.warn(prefixedMessage)
      } else {
        console.error(prefixedMessage)
      }
    }

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
    'debug',
    segmentIndex === 0
      ? `Initiating search for user content…\nURL: ${initialUrl}`
      : `Fetching next block of older results…\nURL: ${initialUrl}`,
  )

  const firstPageDoc = await getDocument(initialUrl, baseURL, adapterName)

  const nav = firstPageDoc.querySelector('nav.pageNavWrapper ul.pageNav-main')
  const sampleLink = nav?.querySelector(
    "a[href*='page=']",
  ) as HTMLAnchorElement | null
  const sampleHref = sampleLink?.getAttribute('href') || ''
  const last = nav?.lastElementChild?.textContent
  const totalPages = sampleLink ? parseInt(last ?? '1', 10) : 1

  const urlTemplate = sampleHref
    ? new URL(withDomain(baseURL, sampleHref))
    : new URL(initialUrl)

  const basePath = urlTemplate.origin + urlTemplate.pathname
  const baseParams = urlTemplate.searchParams
  const pageParamName = 'page'

  for (let pageNo = 1; pageNo <= totalPages; pageNo++) {
    try {
      const params = new URLSearchParams(baseParams)
      params.set(pageParamName, String(pageNo))
      const pageUrl = `${basePath}?${params.toString()}`

      const doc = await getDocument(pageUrl, baseURL, adapterName)

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
        customError(adapterName, "There's no data for this link")
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
        const href = removePostNumber(withDomain(baseURL, anchor.href))
        const existingStoryResult = storyData.find((d) => d.title === title)
        if (existingStoryResult) {
          existingStoryResult.count++
        } else {
          const newStoryResult: StoryResult = {
            title,
            link: href,
            count: 1,
            isAuthor: false,
          }
          storyData.push(newStoryResult)
        }
      })

      progressCallback({
        page: pageOffset + pageNo,
        totalPages: pageOffset + totalPages,
        found: storyData.length,
      })
      sendLog(
        'info',
        `Successfully parsed page ${pageNo} of ${totalPages}. Total unique threads discovered: ${storyData.length}.`,
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
          const nextURL = withDomain(baseURL, viewOlder.href)
          const nextOffset = pageOffset + totalPages

          if (segmentIndex > 10) {
            sendLog(
              'error',
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
            storyData,
            progressCallback,
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

export default collectPaginatedResults
