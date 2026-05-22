import getXenForoData from './xenforo'

import type { ProgressData, StoryResult } from '@/types'

async function getSufficientVelocityData(
  userURL: string,
  progressCallback: (progress: ProgressData) => void,
): Promise<StoryResult[]> {
  const adapterName = 'SufficientVelocityAdapter'
  const baseURL = 'https://forums.sufficientvelocity.com/'

  return getXenForoData(adapterName, baseURL, userURL, progressCallback)
}

export default getSufficientVelocityData
