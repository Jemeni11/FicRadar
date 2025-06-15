import type { ProgressData, storyObject } from "@/types"

import getXenForoData from "./xenforo"

async function getSpaceBattlesData(
  userURL: string,
  progressCallback?: (progress: ProgressData) => void
): Promise<storyObject[]> {
  const adapterName = "SpaceBattlesAdapter"
  const baseURL = "https://forums.spacebattles.com"

  return getXenForoData(adapterName, baseURL, userURL, progressCallback)
}

export default getSpaceBattlesData
