import { useRef, useState } from 'react'

import { storage } from '#imports'

import { BuyMeACoffeeIcon, LinkOutIcon } from '@/icons'

import '@/assets/tailwind.css'
import cn from '@/utils/cn'

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
    <div className="relative flex flex-col sm:h-screen sm:flex-row">
      {/* Sidebar */}
      <aside className="flex size-full shrink-0 flex-col border-r border-gray-200 bg-gray-50 sm:w-64">
        <div className="sticky top-0 z-10 border-b bg-gray-50 pb-4">
          <div className="border-b p-4 text-lg font-bold">Upload</div>

          <div className="my-6 px-4 text-sm text-gray-600">
            Upload a file with XenForo author profile links.
          </div>

          <div className="space-y-6 px-4 pb-4 text-sm text-gray-700">
            <div className="space-y-3">
              <h2 className="text-sm font-semibold tracking-wide text-gray-800 uppercase">
                Supported File Types
              </h2>

              <div className="space-y-3 rounded-md border border-gray-200 bg-white p-3 text-sm">
                <div className="space-y-1">
                  <p className="font-medium text-gray-800">📄 JSON</p>
                  <p className="text-[13px] leading-snug text-gray-600">
                    A list of objects, each with an{' '}
                    <code className="rounded bg-gray-100 px-1 py-0.5 text-[0.85em]">
                      authorLink
                    </code>{' '}
                    field.
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-medium text-gray-800">📝 TXT</p>
                  <ul className="list-disc space-y-1 pl-4 text-[13px] text-gray-600">
                    <li>
                      Just the link:
                      <br />
                      <code className="rounded bg-gray-100 px-1 py-0.5 text-[0.8em] wrap-break-word">
                        https://forums.spacebattles.com/members/example.12345/
                      </code>
                    </li>
                    <li>
                      Or a line like:
                      <br />
                      <code className="rounded bg-gray-100 px-1 py-0.5 text-[0.8em] wrap-break-word">
                        Author Link:
                        https://forums.sufficientvelocity.com/members/example.12345/
                      </code>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-[12px] leading-tight text-gray-500">
              TalesTrove export formats are fully supported.{' '}
              <span className="mt-1 block">
                <strong>Note:</strong> story-only files (LinksOnlyTXT) won’t
                work.
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <main className="flex-1 overflow-auto bg-white p-8">
          <h1 className="mb-6 text-2xl font-bold">FicRadar File Upload</h1>

          <form
            onSubmit={handleFileSubmit}
            className="w-full max-w-md space-y-4"
          >
            {/* Hidden file input */}
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

            {/* Label styled like a button */}
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

            {/* Feedback */}
            {error && <div className="text-sm text-red-500">{error}</div>}
            {success && <div className="text-sm text-green-600">{success}</div>}

            {/* Upload button */}
            <button
              type="submit"
              disabled={isUploading || !selectedFileName?.trim()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-fr-1 py-1.5 text-center text-lg disabled:opacity-50"
            >
              <span>{isUploading ? 'Processing...' : 'Upload & Scan'}</span>
              <LinkOutIcon className="size-4" />
            </button>
          </form>
        </main>
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
      </div>
    </div>
  )
}
