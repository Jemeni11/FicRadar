import getXenForoData from './xenforo'

import type { ProgressData, StoryResult } from '@/types'

async function getQuestionableQuestingData(
  userURL: string,
  progressCallback: (progress: ProgressData) => void,
  getUserStoriesOnly?: boolean,
): Promise<StoryResult[]> {
  const adapterName = 'QuestionableQuestingAdapter'
  const baseURL = 'https://forum.questionablequesting.com'

  return getXenForoData(
    adapterName,
    baseURL,
    userURL,
    progressCallback,
    getUserStoriesOnly,
  )
}

export default getQuestionableQuestingData
