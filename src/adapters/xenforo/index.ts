import { customError } from '@/utils/helpers'
import { withDomain } from '@/utils/url'

import collectPaginatedResults from './collectPaginatedResults'
import getDocument from './getDocument'

import type { ProgressData, StoryResult } from '@/types'

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

    console.log('🔍 Scraping started for:', firstLink)

    const profileDoc = await getDocument(firstLink, baseURL, adapterName)

    const link = profileDoc.querySelector(
      getUserStoriesOnly
        ? 'a.menu-linkRow[href^="/search/member?user_id="][href$="&content=thread"]'
        : 'a.menu-linkRow[href^="/search/member?user_id="]',
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
