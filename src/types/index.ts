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
  | { progress: ProgressData }
  | { done: true; data: storyObject[] }
  | { error: { name: string; message: string; stack?: string; cause?: string } }

export type fileFormatType = "json" | "txt" | "csv" | "html" | "linksOnly"

export type fileFormatObject = Record<fileFormatType, boolean>
