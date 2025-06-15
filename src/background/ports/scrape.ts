import {
  getQuestionableQuestingData,
  getSpaceBattlesData,
  getSufficientVelocityData
} from "@/adapters"
import type { ProgressData, SupportedSites } from "@/types"

import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.PortHandler = async (req, res) => {
  const { id, url } = req.body as {
    id: SupportedSites
    url: string
  }

  const progressCallback = (progress: ProgressData) => {
    // send intermediate progress
    res.send({ progress })
  }

  try {
    let data = []

    switch (id) {
      case "QuestionableQuesting":
        data = await getQuestionableQuestingData(url, progressCallback)
        break
      case "SpaceBattles":
        data = await getSpaceBattlesData(url, progressCallback)
        break
      case "SufficientVelocity":
        data = await getSufficientVelocityData(url, progressCallback)
        break
    }

    // send final result
    res.send({ done: true, data })
  } catch (error) {
    res.send({
      error: {
        name: error.name,
        message: error.message,
        cause: error.cause,
        stack: error.stack
      }
    })
  }
}

export default handler
