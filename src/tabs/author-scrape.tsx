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
    return []
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
  const [hasStartedScraping, setHasStartedScraping] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

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
    console.log("🔍 scrapeAllAuthors called with:", authorList)

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
      try {
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

        const deduped = Array.from(new Set(links)).filter((url) => {
          try {
            const hostname = new URL(url).hostname
            return hostname in SUPPORTED_SITES
          } catch {
            return false
          }
        })

        console.log("Links: ", links)
        console.log("Deduped Links: ", deduped)

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

        setAuthors(authorStates)
        setHasStartedScraping(true)
      } catch (err) {
        console.error("Top-level init error", err)
      }
    }

    init()
  }, [])

  useEffect(() => {
    if (hasStartedScraping) {
      scrapeAllAuthors(authors)
    }
  }, [hasStartedScraping])

  const selectedAuthor = authors[selectedAuthorIndex]
  const completedCount = authors.filter(
    (a) => a.status === "success" || a.status === "error",
  ).length

  return (
    <div className="flex h-screen relative">
      {/* Mobile toggle button */}
      <button
        className="fixed top-4 left-4 z-30 p-2 bg-gray-800 text-white rounded-md min-[450px]:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 min-[450px]:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={`
        ${isSidebarOpen ? "visible translate-x-0" : "invisible min-[450px]:visible -translate-x-full"} 
        min-[450px]:translate-x-0  
        bg-gray-50 border-r border-gray-200 flex flex-col
        fixed min-[450px]:relative 
        h-full z-30 
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "w-full min-[450px]:w-64" : "w-0 min-[450px]:w-64"}
        `}>
        <div className="sticky top-0 bg-gray-50 z-10 space-y-4 border-b pb-4 w-full">
          <button
            className="bg-red-700 py-2 min-[450px]:hidden px-4 w-[90%] rounded-md mx-[5%] my-2 text-white font-bold text-xl"
            type="button"
            onClick={() => setIsSidebarOpen(false)}>
            Close Sidebar
          </button>
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
              onClick={() => {
                setSelectedAuthorIndex(idx)
                if (window.innerWidth < 450) {
                  setIsSidebarOpen(false)
                }
              }}>
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

      <main
        className={`flex-1 overflow-auto py-4 px-8 min-[450px]:py-8 min-[450px]:px-8 transition-all duration-300 ${
          isSidebarOpen ? "min-[450px]:ml-0 ml-16" : "ml-16 min-[450px]:ml-0"
        }`}>
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
          <div className="text-gray-400 italic">Awaiting scraping…</div>
        )}

        {selectedAuthor?.status === "pending" && (
          <>
            <div className="text-gray-500 animate-pulse">
              Scraping in progress…
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
            ❌ Failed to scrape this author. Check the console for more info.
          </div>
        )}

        {selectedAuthor?.status === "success" && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                {selectedAuthor.stories.length} stories found:
              </p>

              <div className="flex bg-gray-200 rounded-md p-0.5">
                <button
                  type="button"
                  aria-label="List View"
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-purple-500 ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-purple-700 font-medium"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-300"
                  }`}>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Grid View"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-purple-500 ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-purple-700 font-medium"
                      : "text-gray-500 hover:text-gray-800 hover:bg-gray-300"
                  }`}>
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24">
                    <path d="M4 6h4v4H4V6zm12 0h4v4h-4V6zM4 14h4v4H4v-4zm12 0h4v4h-4v-4z" />
                  </svg>
                </button>
              </div>
            </div>

            {viewMode === "list" ? (
              <div
                className="flex flex-col gap-1 text-base md:text-sm"
                style={{ contentVisibility: "auto" }}>
                {selectedAuthor.stories.map((story, idx) => (
                  <a
                    key={story.link}
                    href={story.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-md group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 transition-colors">
                    <span className="text-gray-400 font-medium w-6 lg:w-8 shrink-0 text-right mr-3 tabular-nums">
                      {idx + 1}.
                    </span>
                    <span className="text-blue-700 group-hover:underline truncate flex-1 min-w-0 mr-4">
                      {story.title}
                    </span>
                    <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium tabular-nums shrink-0">
                      {story.count}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 text-base md:text-sm">
                {selectedAuthor.stories.map((story) => (
                  <a
                    key={story.link}
                    href={story.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col justify-between p-4 border border-gray-200 rounded-lg bg-white hover:border-gray-300 hover:shadow-sm hover:-translate-y-0.5 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500">
                    <span className="text-blue-700 font-medium group-hover:underline line-clamp-2 mb-3 text-balance">
                      {story.title}
                    </span>
                    <span className="self-end bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-full text-xs font-semibold tabular-nums">
                      {story.count}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
