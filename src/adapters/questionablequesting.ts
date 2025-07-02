import type { ProgressData, StoryResult } from "@/types"

import getXenForoData from "./xenforo"

async function getQuestionableQuestingData(
  userURL: string,
  progressCallback?: (progress: ProgressData) => void,
): Promise<StoryResult[]> {
  const adapterName = "QuestionableQuestingAdapter"
  const baseURL = "https://forum.questionablequesting.com"

  return getXenForoData(adapterName, baseURL, userURL, progressCallback)
}

export default getQuestionableQuestingData
