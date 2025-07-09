import ExportButton from "@/components/ExportButton"
import { SUPPORTED_SITES } from "@/constants"
import {
  BookmarksHTMLIcon,
  CSVIcon,
  HTMLIcon,
  JSONIcon,
  TXTIcon,
} from "@/icons"
import type {
  AuthorStatus,
  ProgressData,
  StoryResult,
  SupportedSites,
} from "@/types"
import {
  delay,
  extractUsername,
  handleGlobalExport,
  saveBookmarkHTMLFile,
  saveCSVFile,
  saveHTMLFile,
  saveJSONFile,
  saveTXTFile,
  sortByCountDescending,
} from "@/utils"
import { useEffect, useState } from "react"

import { Storage } from "@plasmohq/storage"

import "../style.css"

import {
  getQuestionableQuestingData,
  getSpaceBattlesData,
  getSufficientVelocityData,
} from "@/adapters"

const storage = new Storage({ area: "local" })

const scrapeAuthor = async (
  id: SupportedSites,
  url: string,
  setProgressData: React.Dispatch<React.SetStateAction<ProgressData>>,
): Promise<StoryResult[]> => {
  const progressCallback = (progress: ProgressData) => setProgressData(progress)

  try {
    let data: StoryResult[] = []

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

    return data
  } catch (err) {
    console.error(err)
    throw err
  }
}

export default function AuthorScrapeTab() {
  const [authors, setAuthors] = useState<AuthorStatus[]>([])
  const [selectedAuthorIndex, setSelectedAuthorIndex] = useState(0)
  const [progressData, setProgressData] = useState<ProgressData>({
    page: 0,
    totalPages: 0,
    found: 0,
  })

  const updateStatus = (
    index: number,
    status: AuthorStatus["status"],
    stories?: StoryResult[],
  ) => {
    setAuthors((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        status,
        stories: stories ?? [],
      }
      return updated
    })
  }

  const scrapeAllAuthors = async (authorList: AuthorStatus[]) => {
    for (let i = 0; i < authorList.length; i++) {
      console.log(authorList)
      console.log(authorList[i])
      const author = authorList[i]
      setSelectedAuthorIndex(i)

      updateStatus(i, "pending")

      try {
        const hostname = new URL(author.url).hostname
        const id = SUPPORTED_SITES[hostname] as SupportedSites

        // Add delay between authors (but not for the first one)
        if (i > 0) {
          console.log("Delaying for 3 seconds between authors")
          await delay(3000)
          console.log("Delay over")
        }

        // Reset progress for this author
        setProgressData({ page: 0, totalPages: 0, found: 0 })

        const data = await scrapeAuthor(id, author.url, setProgressData)

        if (data) {
          updateStatus(i, "success", sortByCountDescending(data))
          console.log(
            `Successfully scraped ${data.length} stories for ${author.name}`,
          )
        }
      } catch (err) {
        console.error("Scrape error:", err)
        updateStatus(i, "error")
      }
    }
  }

  const handleDownloadTXT = () => {
    if (selectedAuthor?.stories) {
      saveTXTFile(selectedAuthor, `${selectedAuthor.name}_stories.txt`)
    }
  }

  const handleDownloadJSON = () => {
    if (selectedAuthor?.stories) {
      saveJSONFile(selectedAuthor, `${selectedAuthor.name}_stories.json`)
    }
  }

  const handleDownloadCSV = () => {
    if (selectedAuthor?.stories) {
      saveCSVFile(selectedAuthor, `${selectedAuthor.name}_stories.csv`)
    }
  }

  const handleDownloadHTML = () => {
    if (selectedAuthor?.stories) {
      saveHTMLFile(selectedAuthor, `${selectedAuthor.name}_stories.html`)
    }
  }

  const handleDownloadBookmarkHTML = () => {
    if (selectedAuthor?.stories) {
      saveBookmarkHTMLFile(
        selectedAuthor,
        `${selectedAuthor.name}_stories.html`,
      )
    }
  }

  useEffect(() => {
    const init = async () => {
      const [batchList, singleURL] = await Promise.all([
        storage.get("batchAuthorStories"),
        storage.get("singleAuthorURL"),
      ])

      let links: string[] = []

      if (Array.isArray(batchList)) {
        links = batchList
      } else if (typeof singleURL === "string" && singleURL.trim()) {
        links = [singleURL]
      }

      console.log(links)

      const deduped = Array.from(new Set(links)).filter((url) => {
        try {
          const hostname = new URL(url).hostname
          return hostname in SUPPORTED_SITES
        } catch {
          return false
        }
      })

      console.log(deduped)

      if (deduped.length === 0) {
        console.warn("No valid URLs found to scrape")
        return
      }

      const authorStates: AuthorStatus[] = deduped.map((url) => ({
        name: extractUsername(url) ?? "Unknown",
        url,
        status: "queued",
        stories: [],
      }))

      console.log(authorStates)

      setAuthors(authorStates)

      // Start scraping
      scrapeAllAuthors(authorStates)
    }

    init()
  }, [])

  const selectedAuthor = authors[selectedAuthorIndex]
  const completedCount = authors.filter(
    (a) => a.status === "success" || a.status === "error",
  ).length

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="sticky top-0 bg-gray-50 z-10 space-y-4 border-b pb-4 w-full">
          <div className="p-4 font-bold text-lg border-b">Authors</div>
          <div className="my-8 px-4 text-sm text-gray-600">
            Progress: {completedCount}/{authors.length}
            <div className="w-full h-2 bg-gray-200 rounded my-2">
              <div
                className="h-full bg-purple-500 rounded transition-all duration-300"
                style={{
                  width: `${(completedCount / authors.length) * 100}%`,
                }}
              />
            </div>
          </div>
          {completedCount === authors.length && authors.length > 1 && (
            <div className="px-4 mb-6">
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Export All Stories
              </label>
              <select
                className="w-full px-3 py-2 border rounded text-sm bg-white"
                onChange={(e) => {
                  const format = e.target.value
                  if (!format) return
                  handleGlobalExport(authors, format)
                }}>
                <option value="">Select format</option>
                <option value="txt">Download All as TXT</option>
                <option value="json">Download All as JSON</option>
                <option value="csv">Download All as CSV</option>
                <option value="html">Download All as HTML</option>
                <option value="bookmark">Download All as Bookmark HTML</option>
              </select>
            </div>
          )}
        </div>
        <ul className="overflow-auto flex-1">
          {authors.map((author, idx) => (
            <li
              key={author.url}
              className={`p-3 cursor-pointer flex items-center justify-between border-b text-sm hover:bg-gray-200 transition ${
                idx === selectedAuthorIndex ? "bg-purple-100 font-semibold" : ""
              }`}
              onClick={() => setSelectedAuthorIndex(idx)}>
              <span>{author.name}</span>
              <span className="text-xs text-gray-500">
                {author.status === "queued" && "🟡 Not started"}
                {author.status === "pending" && "⏳ Loading"}
                {author.status === "success" &&
                  `${author.stories.length} stories`}
                {author.status === "error" && "❌"}
              </span>
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        <div className="inline-block">
          <h1 className="text-2xl font-bold mb-4">
            <a
              href={selectedAuthor?.url}
              target="_blank"
              className="hover:underline hover:text-fr-1 hover:underline-offset-4">
              {selectedAuthor?.name}
            </a>
          </h1>
          {selectedAuthor?.status === "success" && (
            <div className="mb-4">
              <h2 className="text-sm text-gray-500 font-medium mb-2">
                Export stories as:
              </h2>
              <div className="hidden md:flex flex-wrap gap-2 mb-4">
                <ExportButton
                  label="TXT"
                  icon={<TXTIcon className="w-4 h-4" />}
                  onClick={handleDownloadTXT}
                />
                <ExportButton
                  label="JSON"
                  icon={<JSONIcon className="w-4 h-4" />}
                  onClick={handleDownloadJSON}
                />
                <ExportButton
                  label="CSV"
                  icon={<CSVIcon className="w-4 h-4" />}
                  onClick={handleDownloadCSV}
                />
                <ExportButton
                  label="HTML"
                  icon={<HTMLIcon className="w-4 h-4" />}
                  onClick={handleDownloadHTML}
                />
                <ExportButton
                  label="Bookmark HTML"
                  icon={<BookmarksHTMLIcon className="w-4 h-4" />}
                  onClick={handleDownloadBookmarkHTML}
                />
              </div>

              <div className="md:hidden mb-4">
                <label className="text-sm text-gray-600 block mb-1">
                  Export Format
                </label>
                <select
                  className="w-full px-3 py-2 border rounded text-sm bg-white"
                  onChange={(e) => {
                    const format = e.target.value
                    if (format === "txt") handleDownloadTXT()
                    if (format === "json") handleDownloadJSON()
                    if (format === "csv") handleDownloadCSV()
                    if (format === "html") handleDownloadHTML()
                    if (format === "bookmark") handleDownloadBookmarkHTML()
                  }}>
                  <option value="">Select format</option>
                  <option value="txt">Download TXT</option>
                  <option value="json">Download JSON</option>
                  <option value="csv">Download CSV</option>
                  <option value="html">Download HTML</option>
                  <option value="bookmark">Download Bookmark HTML</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {selectedAuthor?.status === "queued" && (
          <div className="text-gray-400 italic">Awaiting scraping...</div>
        )}

        {selectedAuthor?.status === "pending" && (
          <>
            <div className="text-gray-500 animate-pulse">
              Scraping in progress...
            </div>
            <div className="my-8 text-sm text-gray-600">
              Page Progress: {progressData.page}/{progressData.totalPages}
              <div className="w-full h-2 bg-gray-200 rounded my-2">
                <div
                  className="h-full bg-purple-500 rounded transition-all duration-300"
                  style={{
                    width: `${(progressData.page / progressData.totalPages) * 100}%`,
                  }}
                />
              </div>
              <small>Found {progressData.found} unique thread(s)</small>
            </div>
          </>
        )}

        {selectedAuthor?.status === "error" && (
          <div className="text-red-600 font-semibold">
            ❌ Failed to scrape this author.
          </div>
        )}

        {selectedAuthor?.status === "success" && (
          <>
            <p className="text-gray-600 mb-2">
              {selectedAuthor.stories.length} stories found:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              {selectedAuthor.stories.map((story) => (
                <li key={story.link} data-count={story.count}>
                  <a
                    href={story.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline">
                    {story.title}
                  </a>
                </li>
              ))}
            </ol>
          </>
        )}
      </main>
    </div>
  )
}
