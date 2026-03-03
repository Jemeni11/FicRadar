export type SupportedSites =
  | "QuestionableQuesting"
  | "SpaceBattles"
  | "SufficientVelocity"

export type LogLevel = "debug" | "info" | "warn" | "error"

export type LogEntry = {
  timestamp: string
  level: LogLevel
  message: string
}

export type ProgressData = {
  page: number
  totalPages: number
  found: number
  logEntry?: LogEntry
}

export type TalesTroveJSONType = {
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
  stories: StoryResult[]
}

export type StoryResult = {
  title: string
  link: string
  count: number
}

export type FileFormat = "json" | "txt" | "csv" | "html" | "bookmarksHtml"
