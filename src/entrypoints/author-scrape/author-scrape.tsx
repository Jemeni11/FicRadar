import { useEffect, useRef, useState } from 'react'

import { storage } from '#imports'

import {
  getQuestionableQuestingData,
  getSpaceBattlesData,
  getSufficientVelocityData,
} from '@/adapters'
import ExportButton from '@/components/shared/ExportButton'
import { SUPPORTED_SITES } from '@/constants'
import {
  BookmarksHTMLIcon,
  BuyMeACoffeeIcon,
  CSVIcon,
  HTMLIcon,
  JSONIcon,
  TXTIcon,
} from '@/icons'
import {
  handleGlobalExport,
  saveBookmarkHTMLFile,
  saveCSVFile,
  saveHTMLFile,
  saveJSONFile,
  saveTXTFile,
} from '@/utils/export'
import { delay, sortByCountDescending } from '@/utils/helpers'
import { extractUsername } from '@/utils/url'

import '@/assets/tailwind.css'

import type {
  AuthorStatus,
  LogEntry,
  ProgressData,
  StoryResult,
  SupportedSites,
} from '@/types'

const scrapeAuthor = async (
  id: SupportedSites,
  url: string,
  progressCallback: (progress: ProgressData) => void,
): Promise<StoryResult[]> => {
  try {
    let data: StoryResult[] = []

    switch (id) {
      case 'QuestionableQuesting':
        data = await getQuestionableQuestingData(url, progressCallback)
        break
      case 'SpaceBattles':
        data = await getSpaceBattlesData(url, progressCallback)
        break
      case 'SufficientVelocity':
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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [logs, setLogs] = useState<LogEntry[]>([])

  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const updateStatus = (
    index: number,
    status: AuthorStatus['status'],
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
    console.log('🔍 scrapeAllAuthors called with:', authorList)

    for (let i = 0; i < authorList.length; i++) {
      console.log(authorList)
      console.log(authorList[i])
      const author = authorList[i]
      setSelectedAuthorIndex(i)

      updateStatus(i, 'pending')

      try {
        const hostname = new URL(author.url).hostname
        const id = SUPPORTED_SITES[hostname]

        // Add delay between authors (but not for the first one)
        if (i > 0) {
          console.log('Delaying for 3 seconds between authors')
          await delay(3000)
          console.log('Delay over')
        }

        // Reset progress for this author
        setProgressData({ page: 0, totalPages: 0, found: 0 })
        setLogs([])

        const data = await scrapeAuthor(id, author.url, (progress) => {
          if (progress.page !== -1) {
            setProgressData({
              page: progress.page,
              totalPages: progress.totalPages,
              found: progress.found,
            })
          }
          if (progress.logEntry) {
            setLogs((prev) => [...prev, progress.logEntry!])
          }
        })

        if (data) {
          updateStatus(i, 'success', sortByCountDescending(data))
          console.log(
            `Successfully scraped ${data.length} stories for ${author.name}`,
          )
        }
      } catch (err) {
        console.error('Scrape error:', err)
        updateStatus(i, 'error')
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
        `${selectedAuthor.name}_stories_bookmark.html`,
      )
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const [batchList, singleURL] = await Promise.all([
          storage.getItem<string[]>('local:batchAuthorStories'),
          storage.getItem<string>('local:singleAuthorURL'),
        ])

        let links: string[] = []

        if (Array.isArray(batchList)) {
          links = batchList
        } else if (typeof singleURL === 'string' && singleURL.trim()) {
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

        console.log('Links: ', links)
        console.log('Deduped Links: ', deduped)

        if (deduped.length === 0) {
          console.warn('No valid URLs found to scrape')
          return
        }

        const authorStates: AuthorStatus[] = deduped.map((url) => ({
          name: extractUsername(url) ?? 'Unknown',
          url,
          status: 'queued',
          stories: [],
        }))

        setAuthors(authorStates)
        setHasStartedScraping(true)
      } catch (err) {
        console.error('Top-level init error', err)
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
    (a) => a.status === 'success' || a.status === 'error',
  ).length

  return (
    <div className="relative flex h-screen">
      {/* Mobile toggle button */}
      <button
        className="fixed top-4 left-4 z-30 rounded-md bg-gray-800 p-2 text-white min-[450px]:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
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
          className="bg-opacity-50 fixed inset-0 z-20 bg-black min-[450px]:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={` ${isSidebarOpen ? 'visible translate-x-0' : 'invisible -translate-x-full min-[450px]:visible'} fixed z-30 flex h-full flex-col border-r border-gray-200 bg-gray-50 transition-transform duration-300 ease-in-out min-[450px]:relative min-[450px]:translate-x-0 ${isSidebarOpen ? 'w-full min-[450px]:w-64' : 'w-0 min-[450px]:w-64'} `}
      >
        <div className="sticky top-0 z-10 w-full space-y-4 border-b bg-gray-50 pb-4">
          <button
            className="mx-[5%] my-2 w-[90%] rounded-md bg-red-700 px-4 py-2 text-xl font-bold text-white min-[450px]:hidden"
            type="button"
            onClick={() => setIsSidebarOpen(false)}
          >
            Close Sidebar
          </button>
          <div className="border-b p-4 text-lg font-bold">Authors</div>
          <div className="my-8 px-4 text-sm text-gray-600">
            Progress: {completedCount}/{authors.length}
            <div className="my-2 h-2 w-full rounded bg-gray-200">
              <div
                className="h-full rounded bg-purple-500 transition-all duration-300"
                style={{
                  width: `${(completedCount / authors.length) * 100}%`,
                }}
              />
            </div>
          </div>
          {completedCount === authors.length && authors.length > 1 && (
            <div className="mb-6 px-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Export All Stories
              </label>
              <select
                className="w-full rounded border bg-white px-3 py-2 text-sm"
                onChange={(e) => {
                  const format = e.target.value
                  if (!format) return
                  handleGlobalExport(authors, format)
                }}
              >
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
        <ul className="flex-1 overflow-auto">
          {authors.map((author, idx) => (
            <li
              key={author.url}
              className={`flex cursor-pointer items-center justify-between border-b p-3 text-sm transition hover:bg-gray-200 ${
                idx === selectedAuthorIndex ? 'bg-purple-100 font-semibold' : ''
              }`}
              onClick={() => {
                setSelectedAuthorIndex(idx)
                if (window.innerWidth < 450) {
                  setIsSidebarOpen(false)
                }
              }}
            >
              <span>{author.name}</span>
              <span className="text-xs text-gray-500">
                {author.status === 'queued' && '🟡 Not started'}
                {author.status === 'pending' && '⏳ Loading'}
                {author.status === 'success' &&
                  `${author.stories.length} stories`}
                {author.status === 'error' && '❌'}
              </span>
            </li>
          ))}
        </ul>
      </aside>

      <main
        className={`flex h-screen flex-1 flex-col overflow-hidden transition-all duration-300 ${
          isSidebarOpen ? 'ml-16 min-[450px]:ml-0' : 'ml-16 min-[450px]:ml-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-8 py-4 min-[450px]:px-8 min-[450px]:py-8">
          <div className="block max-w-full">
            <h1 className="mb-4 text-2xl font-bold break-all">
              <a
                href={selectedAuthor?.url}
                target="_blank"
                className="hover:text-fr-1 hover:underline hover:underline-offset-4"
              >
                {selectedAuthor?.name}
              </a>
            </h1>
            {selectedAuthor?.status === 'success' && (
              <div className="mb-4">
                <h2 className="mb-2 text-sm font-medium text-gray-500">
                  Export stories as:
                </h2>
                <div className="mb-4 hidden flex-wrap gap-2 md:flex">
                  <ExportButton
                    label="TXT"
                    icon={<TXTIcon className="h-4 w-4" />}
                    onClick={handleDownloadTXT}
                  />
                  <ExportButton
                    label="JSON"
                    icon={<JSONIcon className="h-4 w-4" />}
                    onClick={handleDownloadJSON}
                  />
                  <ExportButton
                    label="CSV"
                    icon={<CSVIcon className="h-4 w-4" />}
                    onClick={handleDownloadCSV}
                  />
                  <ExportButton
                    label="HTML"
                    icon={<HTMLIcon className="h-4 w-4" />}
                    onClick={handleDownloadHTML}
                  />
                  <ExportButton
                    label="Bookmark HTML"
                    icon={<BookmarksHTMLIcon className="h-4 w-4" />}
                    onClick={handleDownloadBookmarkHTML}
                  />
                </div>

                <div className="mb-4 md:hidden">
                  <label className="mb-1 block text-sm text-gray-600">
                    Export Format
                  </label>
                  <select
                    className="w-full rounded border bg-white px-3 py-2 text-sm"
                    onChange={(e) => {
                      const format = e.target.value
                      if (format === 'txt') handleDownloadTXT()
                      if (format === 'json') handleDownloadJSON()
                      if (format === 'csv') handleDownloadCSV()
                      if (format === 'html') handleDownloadHTML()
                      if (format === 'bookmark') handleDownloadBookmarkHTML()
                    }}
                  >
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

          {selectedAuthor?.status === 'queued' && (
            <div className="text-gray-400 italic">Awaiting scraping…</div>
          )}

          {selectedAuthor?.status === 'pending' && (
            <>
              <div className="mb-4 animate-pulse text-gray-500">
                Scraping in progress…
              </div>

              <div className="mb-4 text-sm text-gray-600">
                Page Progress: {progressData.page}/{progressData.totalPages}
                <div className="my-2 h-2 w-full rounded border border-gray-300 bg-gray-200">
                  <div
                    className="h-full rounded bg-purple-500 transition-all duration-300"
                    style={{
                      width: `${(progressData.page / Math.max(progressData.totalPages, 1)) * 100}%`,
                    }}
                  />
                </div>
                <small>Found {progressData.found} unique thread(s)</small>
              </div>

              <div className="my-6 flex h-64 flex-col overflow-hidden rounded-md border border-gray-800 bg-[#0d1117] font-mono text-xs text-gray-300 shadow-inner">
                <div className="flex items-center border-b border-gray-700 bg-gray-800 px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase select-none">
                  <span>logs — {selectedAuthor.name}</span>
                </div>
                <div className="flex flex-1 flex-col overflow-y-auto p-3 font-mono leading-relaxed [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-track]:bg-[#0d1117]">
                  {logs.length === 0 && (
                    <div className="text-gray-600 italic">
                      Waiting for logs…
                    </div>
                  )}
                  {logs.map((log, i) => (
                    <div
                      key={i}
                      className="-mx-1 mb-2 flex flex-col rounded px-1 hover:bg-[#161b22] lg:mb-1 lg:flex-row lg:items-start lg:gap-3"
                    >
                      <div className="flex shrink-0 gap-3 select-none">
                        <span className="text-gray-500">
                          {new Date(log.timestamp)
                            .toISOString()
                            .split('T')[1]
                            .replace('Z', '')}
                        </span>
                        <span
                          className={`w-12 font-bold uppercase ${
                            log.level === 'error'
                              ? 'text-red-400'
                              : log.level === 'warn'
                                ? 'text-yellow-400'
                                : log.level === 'info'
                                  ? 'text-blue-400'
                                  : 'text-green-400'
                          }`}
                        >
                          {log.level}
                        </span>
                      </div>
                      <span className="mt-1 flex-1 wrap-break-word whitespace-pre-wrap text-gray-300 lg:mt-0">
                        {log.message}
                      </span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </>
          )}

          {selectedAuthor?.status === 'error' && (
            <div className="font-semibold text-red-600">
              ❌ Failed to scrape this author. Check the console for more info.
            </div>
          )}

          {selectedAuthor?.status === 'success' && (
            <>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-gray-600">
                  {selectedAuthor.stories.length} stories found:
                </p>

                <div className="flex rounded-md bg-gray-200 p-0.5">
                  <button
                    type="button"
                    aria-label="List View"
                    onClick={() => setViewMode('list')}
                    className={`rounded-sm p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none ${
                      viewMode === 'list'
                        ? 'bg-white font-medium text-purple-700 shadow-sm'
                        : 'text-gray-500 hover:bg-gray-300 hover:text-gray-800'
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
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
                    onClick={() => setViewMode('grid')}
                    className={`rounded-sm p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none ${
                      viewMode === 'grid'
                        ? 'bg-white font-medium text-purple-700 shadow-sm'
                        : 'text-gray-500 hover:bg-gray-300 hover:text-gray-800'
                    }`}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4 6h4v4H4V6zm12 0h4v4h-4V6zM4 14h4v4H4v-4zm12 0h4v4h-4v-4z" />
                    </svg>
                  </button>
                </div>
              </div>

              {viewMode === 'list' ? (
                <div
                  className="flex flex-col gap-1 text-base md:text-sm"
                  style={{ contentVisibility: 'auto' }}
                >
                  {selectedAuthor.stories.map((story, idx) => (
                    <a
                      key={story.link}
                      href={story.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
                    >
                      <span className="mr-3 w-6 shrink-0 text-right font-medium text-gray-400 tabular-nums lg:w-8">
                        {idx + 1}.
                      </span>
                      <span className="mr-4 min-w-0 flex-1 truncate text-blue-700 group-hover:underline">
                        {story.title}
                      </span>
                      <span className="shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 tabular-nums">
                        {story.count}
                      </span>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 text-base md:text-sm lg:grid-cols-2 xl:grid-cols-3">
                  {selectedAuthor.stories.map((story) => (
                    <a
                      key={story.link}
                      href={story.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none"
                    >
                      <span className="mb-3 line-clamp-2 font-medium text-balance text-blue-700 group-hover:underline">
                        {story.title}
                      </span>
                      <span className="self-end rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 tabular-nums">
                        {story.count}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <footer className="z-10 flex w-full shrink-0 flex-col items-center justify-center gap-2 border-t-2 border-purple-900/50 bg-[#0d1117] p-3 text-center font-mono text-xs sm:flex-row sm:gap-4">
          <p className="text-gray-400">
            Export saved stories for offline. Try{' '}
            <a
              href="https://github.com/Jemeni11/TalesTrove"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-purple-400 underline underline-offset-4 hover:text-purple-300"
            >
              TalesTrove
            </a>
          </p>
          <span className="hidden text-gray-700 sm:inline">|</span>
          <a
            href="https://www.buymeacoffee.com/jemeni11"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 font-bold text-gray-400 transition-colors hover:text-[#FFDD00]"
          >
            <BuyMeACoffeeIcon className="h-4 w-4 text-gray-400 group-hover:text-[#FFDD00]" />
            Buy me a coffee
          </a>
        </footer>
      </main>
    </div>
  )
}
