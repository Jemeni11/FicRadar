import type { AuthorStatus, StoryResult } from "@/types"

import saveBookmarkHTMLFile from "./saveBookmarkHTMLFile"
import saveCSVFile from "./saveCSVFile"
import saveHTMLFile from "./saveHTMLFile"
import saveJSONFile from "./saveJSONFile"
import saveTXTFile from "./saveTXTFile"
import sortByCountDescending from "./sortByCountDescending"

const handleGlobalExport = (authors: AuthorStatus[], format: string) => {
  const allStories = authors
    .filter((a) => a.status === "success")
    .flatMap((a) => a.stories)

  const storyMap = new Map<string, StoryResult>()
  for (const story of allStories) {
    const existing = storyMap.get(story.link)
    if (existing) {
      existing.count += story.count
    } else {
      storyMap.set(story.link, { ...story })
    }
  }

  const dedupedStories = sortByCountDescending(Array.from(storyMap.values()))

  const combinedExport: AuthorStatus = {
    name: "All Authors",
    url: "N/A",
    stories: dedupedStories,
    status: "success",
  }

  const filename = `ficradar_all_stories.${format}`

  switch (format) {
    case "txt":
      saveTXTFile(combinedExport, filename)
      break
    case "json":
      saveJSONFile(combinedExport, filename)
      break
    case "csv":
      saveCSVFile(combinedExport, filename)
      break
    case "html":
      saveHTMLFile(combinedExport, filename)
      break
    case "bookmark":
      saveBookmarkHTMLFile(combinedExport, filename)
      break
  }
}

export default handleGlobalExport
