import { customError } from '@/utils/helpers'
import { withDomain } from '@/utils/url'

import collectPaginatedResults from './collectPaginatedResults'
import discoverProfileSearchLinks from './discoverProfileSearchLinks'
import getDocument from './getDocument'

import type { ProgressData, StoryResult } from '@/types'

const isDev = import.meta.env.DEV

async function getXenForoData(
  adapterName: string,
  baseURL: string,
  userUrl: string,
  progressCallback: (progress: ProgressData) => void,
  getUserStoriesOnly?: boolean,
): Promise<StoryResult[]> {
  const data: StoryResult[] = []

  try {
    const firstLink = withDomain(baseURL, userUrl)

    if (isDev) console.log('🔍 Scraping started for:', firstLink)

    const profileDoc = await getDocument(firstLink, baseURL, adapterName)

    const searchLinks = discoverProfileSearchLinks(profileDoc, baseURL)
    const pageUrl = getUserStoriesOnly
      ? (searchLinks.authoredStoriesUrl ?? searchLinks.authoredThreadsUrl)
      : searchLinks.allContentUrl

    if (!pageUrl) {
      customError(adapterName, 'Could not find user content link')
    }

    await collectPaginatedResults(
      adapterName,
      baseURL,
      pageUrl,
      data,
      progressCallback,
    )
  } catch (err) {
    progressCallback({
      page: -1,
      totalPages: -1,
      found: -1,
      logEntry: {
        timestamp: new Date().toISOString(),
        level: 'error',
        message: `[${adapterName}] Error during scrape. Returning partial results. ${err instanceof Error ? err.message : String(err)}`,
      },
    })
  }

  return data
}

export default getXenForoData
