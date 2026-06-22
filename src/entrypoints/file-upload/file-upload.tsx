import { useRef, useState } from 'react'

import { storage } from '#imports'

import FeedbackLink from '@/components/shared/FeedbackLink'
import { BuyMeACoffeeIcon, LinkOutIcon } from '@/icons'

import '@/assets/tailwind.css'
import cn from '@/utils/cn'

import FileUploadSidebar from './components/FileUploadSidebar'

import type { TalesTroveJSONType } from '@/types'

const parseTextToLinks = (text: string): string[] => {
  const lines = text.split(/\r?\n/)
  const links: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (/^https?:\/\/\S+$/.test(trimmed)) {
      links.push(trimmed)
    } else if (trimmed.startsWith('Author Link:')) {
      const link = trimmed.replace('Author Link:', '').trim()
      if (/^https?:\/\/\S+$/.test(link)) {
        links.push(link)
      }
    }
  }

  return links
}

export default function FileUploadTab() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsUploading(true)

    await storage.removeItem('local:batchAuthorStories')
    await storage.removeItem('local:singleAuthorURL')

    const file = fileInputRef.current?.files?.[0]
    if (!file || !['application/json', 'text/plain'].includes(file.type)) {
      setError('Please select a valid JSON or TXT file.')
      setIsUploading(false)
      return
    }

    try {
      let links: string[]
      const text = await file.text()

      if (file.type === 'application/json') {
        const parsed = JSON.parse(text)
        if (!Array.isArray(parsed)) {
          throw new Error('Uploaded JSON file is not an array.')
        }
        const isValid = parsed.every(
          (item): item is TalesTroveJSONType =>
            typeof item.authorLink === 'string',
        )
        if (!isValid) throw new Error('JSON structure is invalid.')
        links = parsed.map((item) => item.authorLink)
      } else {
        links = parseTextToLinks(text)
        if (links.length === 0) {
          throw new Error('No valid author links found in TXT file.')
        }
      }

      await storage.setItem('local:batchAuthorStories', links)
      setSuccess('File processed! Redirecting...')

      setTimeout(() => {
        void browser.tabs.update({
          url: browser.runtime.getURL('/author-scrape.html'),
        })
      }, 1000)
    } catch (err) {
      console.error('File upload error:', err)
      setError(
        err instanceof Error ? err.message : 'Invalid file format or content.',
      )
      setIsUploading(false)
    }
  }

  return (
    <div className="relative flex h-svh">
      <FileUploadSidebar
        isSidebarOpen={isSidebarOpen}
        onCloseSidebar={() => setIsSidebarOpen(false)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className="flex min-h-svh flex-1 flex-col overflow-hidden transition-all duration-300">
        <div className="flex-1 overflow-y-auto px-4 pt-18 pb-4 min-[600px]:p-8">
          <div className="block max-w-full">
            <h1 className="mb-6 text-2xl font-bold break-all">File Upload</h1>
          </div>

          <form
            onSubmit={handleFileSubmit}
            className="w-full max-w-md space-y-4"
          >
            <input
              ref={fileInputRef}
              id="file"
              type="file"
              accept="application/json,text/plain"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) setSelectedFileName(file.name)
              }}
            />

            <label
              htmlFor="file"
              className={cn(
                'block w-full cursor-pointer rounded-3xl border-2 py-1.5 text-center text-lg transition-colors',
                isUploading
                  ? 'cursor-not-allowed border-gray-500 text-gray-500'
                  : 'border-fr-1 text-fr-1 hover:bg-fr-1 hover:text-white',
              )}
            >
              {selectedFileName || 'Choose File'}
            </label>

            {error && <div className="text-sm text-red-500">{error}</div>}
            {success && <div className="text-sm text-green-600">{success}</div>}

            <button
              type="submit"
              disabled={isUploading || !selectedFileName?.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-fr-1 py-1.5 text-center text-lg text-white disabled:opacity-50"
            >
              <span>{isUploading ? 'Processing...' : 'Upload & Scan'}</span>
              <LinkOutIcon className="size-4" />
            </button>
          </form>
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
            className="group inline font-bold text-gray-400 transition-colors hover:text-[#FFDD00]"
          >
            <BuyMeACoffeeIcon className="mr-1.5 inline-block h-4 w-4 align-middle text-gray-400 group-hover:text-[#FFDD00]" />
            Buy me a coffee
          </a>
          <span className="hidden text-gray-700 sm:inline">|</span>
          <FeedbackLink />
        </footer>
      </main>
    </div>
  )
}
