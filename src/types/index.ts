export type SupportedSites =
  | "QuestionableQuesting"
  | "SpaceBattles"
  | "SufficientVelocity"

export type storyObject = {
  title: string
  link: string
  count: number
}

export type ProgressData = {
  page: number
  totalPages?: number
  found: number
}

export type ScrapeRequest = {
  id: SupportedSites
  url: string
}

export type ScrapeResponse =
  | {
      progress: {
        page: number
        totalPages?: number
        found: number
      }
    }
  | {
      done: true
      data: storyObject[]
    }
  | {
      error: {
        name: string
        message: string
        stack?: string
      }
    }

export type fileFormatType = {
  json: boolean
  txt: boolean
  csv: boolean
  html: boolean
  linksOnly: boolean
}

export type fileFormatTypeKey = keyof fileFormatType
