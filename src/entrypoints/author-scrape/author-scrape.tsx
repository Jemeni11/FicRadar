import { useEffect, useState } from 'react'

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
  saveBookmarkHTMLFile,
  saveCSVFile,
  saveHTMLFile,
  saveJSONFile,
  saveTXTFile,
} from '@/utils/export'
import { delay, sortByCountDescending } from '@/utils/helpers'
import { extractUsername } from '@/utils/url'

import AuthorSidebar from './components/AuthorSidebar'
import ScrapeProgress from './components/ScrapeProgress'
import StoryResults from './components/StoryResults'

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
  getUserStoriesOnly: boolean = false,
): Promise<StoryResult[]> => {
  try {
    let data: StoryResult[] = []

    switch (id) {
      case 'QuestionableQuesting':
        data = await getQuestionableQuestingData(
          url,
          progressCallback,
          getUserStoriesOnly,
        )
        break
      case 'SpaceBattles':
        data = await getSpaceBattlesData(
          url,
          progressCallback,
          getUserStoriesOnly,
        )
        break
      case 'SufficientVelocity':
        data = await getSufficientVelocityData(
          url,
          progressCallback,
          getUserStoriesOnly,
        )
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
  const [authorProgressData, setAuthorProgressData] = useState<ProgressData>({
    page: 0,
    totalPages: 0,
    found: 0,
  })
  const [progressData, setProgressData] = useState<ProgressData>({
    page: 0,
    totalPages: 0,
    found: 0,
  })
  const [hasStartedScraping, setHasStartedScraping] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])

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
        setAuthorProgressData({ page: 0, totalPages: 0, found: 0 })
        setProgressData({ page: 0, totalPages: 0, found: 0 })
        setLogs([])

        const [authorData, data] = await Promise.all([
          scrapeAuthor(
            id,
            author.url,
            (progress) => {
              if (progress.page !== -1) {
                setAuthorProgressData({
                  page: progress.page,
                  totalPages: progress.totalPages,
                  found: progress.found,
                })
              }
            },
            true,
          ),
          scrapeAuthor(id, author.url, (progress) => {
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
          }),
        ])

        if (data.length) {
          const authorLinks = new Set(
            authorData.map((s) => s.link.replace(/\/$/, '')),
          )
          const mutatedData = data.map((datum) => ({
            ...datum,
            isAuthor: authorLinks.has(datum.link.replace(/\/$/, '')),
          }))
          updateStatus(i, 'success', sortByCountDescending(mutatedData))
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
      <AuthorSidebar
        authors={authors}
        selectedAuthorIndex={selectedAuthorIndex}
        completedCount={completedCount}
        isSidebarOpen={isSidebarOpen}
        onSelectAuthor={setSelectedAuthorIndex}
        onCloseSidebar={() => setIsSidebarOpen(false)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className="flex h-screen flex-1 flex-col overflow-hidden transition-all duration-300">
        <div className="flex-1 overflow-y-auto px-4 pt-18 pb-4 min-[450px]:p-8">
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
            <ScrapeProgress
              authorName={selectedAuthor.name}
              authorProgressData={authorProgressData}
              progressData={progressData}
              logs={logs}
            />
          )}

          {selectedAuthor?.status === 'error' && (
            <div className="font-semibold text-red-600">
              ❌ Failed to scrape this author. Check the console for more info.
            </div>
          )}

          {selectedAuthor?.status === 'success' && (
            <StoryResults
              stories={selectedAuthor.stories}
              authorName={selectedAuthor.name}
            />
          )}
        </div>
        <footer className="z-10 flex w-full shrink-0 flex-col items-center justify-center gap-2 bg-fr-surface p-3 text-center font-mono text-xs sm:flex-row sm:gap-4">
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
