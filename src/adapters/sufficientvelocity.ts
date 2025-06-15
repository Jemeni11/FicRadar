import type { ProgressData, storyObject } from "@/types"

import getXenForoData from "./xenforo"

async function getSufficientVelocityData(
  userURL: string,
  progressCallback?: (progress: ProgressData) => void
): Promise<storyObject[]> {
  const adapterName = "SufficientVelocityAdapter"
  const baseURL = "https://forums.sufficientvelocity.com/"

  return getXenForoData(adapterName, baseURL, userURL, progressCallback)
}

export default getSufficientVelocityData
