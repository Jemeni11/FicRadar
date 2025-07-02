export type SupportedSites =
  | "QuestionableQuesting"
  | "SpaceBattles"
  | "SufficientVelocity"

export type ProgressData = {
  page: number
  totalPages: number
  found: number
}

export type ScrapeRequest = {
  id: SupportedSites
  url: string
}

export type ScrapeResponse =
  | { pending: true; progress: ProgressData }
  | { done: true; data: StoryResult[] }
  | { error: { name: string; message: string; stack?: string; cause?: string } }

export type JSONFileType = {
  storyLink: string
  storyName: string
  authorLink: string
  authorName: string
}

export type InputMethod = "paste" | "file"

export type AuthorStatus = {
  name: string
  url: string
  status: "queued" | "pending" | "success" | "error"
  downloadUrl?: string
  stories?: StoryResult[]
}

export type StoryResult = {
  title: string
  link: string
  count: number
}

export type fileFormatType = "json" | "txt" | "csv" | "html" | "linksOnly"

export type fileFormatObject = Record<fileFormatType, boolean>
