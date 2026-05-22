import getXenForoData from './xenforo'

import type { ProgressData, StoryResult } from '@/types'

async function getSpaceBattlesData(
  userURL: string,
  progressCallback: (progress: ProgressData) => void,
): Promise<StoryResult[]> {
  const adapterName = 'SpaceBattlesAdapter'
  const baseURL = 'https://forums.spacebattles.com'

  return getXenForoData(adapterName, baseURL, userURL, progressCallback)
}

export default getSpaceBattlesData
