import type { ProgressData, storyObject } from "@/types"

import getXenForoData from "./xenforo"

async function getQuestionableQuestingData(
  userURL: string,
  progressCallback?: (progress: ProgressData) => void
): Promise<storyObject[]> {
  const adapterName = "QuestionableQuestingAdapter"
  const baseURL = "https://forum.questionablequesting.com"

  return getXenForoData(adapterName, baseURL, userURL, progressCallback)
}

export default getQuestionableQuestingData
