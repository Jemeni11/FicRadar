import { useRef, useState } from 'react'

import { storage } from '#imports'

import Radar from '@/components/shared/Radar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { BuyMeACoffeeIcon, GitHubSponsorsIcon, LinkOutIcon } from '@/icons'
import cn from '@/utils/cn'
import { isValidURL } from '@/utils/url'

import type { InputMethod, TalesTroveJSONType } from '@/types'

import '@/assets/tailwind.css'

export default function Popup() {
  const [isUploading, setIsUploading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [urlError, setUrlError] = useState<string | null>(null)
  const [currentUrl, setCurrentUrl] = useState('')

  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  const [inputMethod, setInputMethod] = useState<InputMethod>('paste')

  const formRef = useRef<HTMLFormElement | null>(null)

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setCurrentUrl(url)

    if (url.trim() === '') {
      setUrlError(null)
      return
    }

    if (!isValidURL(url)) {
      if (!url.startsWith('http')) {
        setUrlError('URL must start with http:// or https://')
      } else {
        try {
          const hostname = new URL(url).hostname
          setUrlError(
            `${hostname} is not supported. Only QuestionableQuesting, SpaceBattles, and SufficientVelocity are supported.`,
          )
        } catch {
          setUrlError('Please enter a valid URL')
        }
      }
    } else {
      setUrlError(null)
    }
  }

  const handleFileFormatSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault()

    await storage.removeItem('local:batchAuthorStories')
    await storage.removeItem('local:singleAuthorURL')

    setError(null)
    setSuccess(null)

    setIsUploading(true)

    const form = formRef.current
    if (!form) {
      throw new Error('Form not available')
    }

    const fileInput = form.elements.namedItem('file') as HTMLInputElement | null
    const file = fileInput?.files?.[0] ?? null

    if (!file || !['application/json', 'text/plain'].includes(file.type)) {
      setError('Please select a valid file.')
      return
    }

    try {
      let stories: string | string[]
      const text = await file.text()

      if (file.type === 'application/json') {
        const parsed = JSON.parse(text)

        if (!Array.isArray(parsed)) {
          throw new Error(
            'The uploaded JSON file is missing the required list of authors.',
          )
        }

        const isValid = parsed.every(
          (item): item is TalesTroveJSONType =>
            typeof item.authorLink === 'string',
        )

        if (!isValid) {
          throw new Error('Uploaded JSON has invalid structure.')
        }

        stories = parsed.map((parse) => parse.authorLink)
      } else {
        // Extract links from raw or TalesTrove-formatted TXT
        const lines = text.split(/\r?\n/)
        const links: string[] = []

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue

          // Direct URL on its own line
          if (/^https?:\/\/\S+$/.test(trimmed)) {
            links.push(trimmed)
          }

          // TalesTrove format: `Author Link: https://…`
          else if (trimmed.startsWith('Author Link:')) {
            const link = trimmed.replace('Author Link:', '').trim()
            if (/^https?:\/\/\S+$/.test(link)) {
              links.push(link)
            }
          }
        }

        if (links.length === 0) {
          throw new Error('No valid story links found in TXT file.')
        }

        stories = links
      }

      await storage.setItem<string[]>('local:batchAuthorStories', stories)

      setSuccess('File processed successfully! Opening scanner…')

      void browser.tabs.create({
        url: browser.runtime.getURL('/author-scrape.html'),
      })
    } catch (err) {
      console.error('File upload failed:', err)
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't read that file. Please upload a valid TalesTrove JSON or a supported TXT file.",
      )
    }

    setIsUploading(false)
  }

  const handleInputFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    await storage.removeItem('local:batchAuthorStories')
    await storage.removeItem('local:singleAuthorURL')

    setError(null)
    setSuccess(null)
    setIsScanning(true)

    try {
      if (!isValidURL(currentUrl)) {
        setError('Please enter a valid and supported URL.')
        return
      }

      await storage.setItem<string>('local:singleAuthorURL', currentUrl)

      setSuccess('Opening scanner…')
      void browser.tabs.create({
        url: browser.runtime.getURL('/author-scrape.html'),
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Try again.',
      )
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="min-h-full w-full pointer-fine:min-h-100 pointer-fine:w-96">
      <div className="flex aspect-video w-full items-center justify-center bg-[linear-gradient(90deg,#141142,#4143c7)]">
        <Radar />
      </div>

      <div className="flex h-full flex-col gap-8 bg-fr-3 p-4 text-white">
        <div className="my-2 w-full text-center">
          <h1 className="mb-2 text-6xl font-bold text-balance">FicRadar</h1>
          <a
            href="https://github.com/Jemeni11/FicRadar"
            target="_blank"
            rel="noreferrer"
            className="text-lg underline underline-offset-2 hover:text-fr-1"
          >
            Project Docs »
          </a>
        </div>
        <ToggleGroup
          aria-label=""
          className="flex w-full rounded-3xl border border-solid border-fr-1 p-1.5"
          value={[inputMethod]}
          onValueChange={(value) => {
            if (value) {
              setInputMethod(value[0] as InputMethod)
            }
          }}
        >
          <ToggleGroupItem
            aria-label="Paste a Link"
            value="paste"
            className={cn(
              inputMethod === 'paste' && 'rounded-[18px] bg-fr-1',
              'w-full flex-1 text-center transition-colors active:scale-[0.97]',
            )}
          >
            Paste a Link
          </ToggleGroupItem>
          <ToggleGroupItem
            aria-label="Upload a File"
            value="file"
            className={cn(
              inputMethod === 'file' && 'rounded-[18px] bg-fr-1',
              'w-full flex-1 text-center transition-colors active:scale-[0.97]',
            )}
          >
            Upload a File
          </ToggleGroupItem>
        </ToggleGroup>

        {error && (
          <div className="rounded-lg border border-red-500 bg-red-900/50 p-3 text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-green-500 bg-green-900/50 p-3 text-green-200">
            {success}
          </div>
        )}

        {inputMethod === 'paste' ? (
          <form
            onSubmit={handleInputFormSubmit}
            className="flex flex-col gap-4"
          >
            <label htmlFor="url">
              <input
                type="url"
                id="url"
                value={currentUrl}
                onChange={handleUrlChange}
                placeholder="Enter author's profile URL"
                className={cn(
                  'mt-0.5 w-full rounded-3xl bg-gray-900 text-white shadow-sm sm:text-sm',
                  urlError ? 'border-red-500' : 'border-fr-1',
                )}
              />
            </label>
            {urlError && (
              <p className="mt-1 text-sm text-red-400">{urlError}</p>
            )}
            <button
              type="submit"
              disabled={isScanning || !currentUrl.trim() || !!urlError}
              className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-fr-1 py-1.5 text-center text-lg disabled:opacity-50"
            >
              <span>{isScanning ? 'Scanning…' : 'Scan Link'}</span>
              <LinkOutIcon className="size-4" />
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="pointer-coarse:hidden">
              <form
                ref={formRef}
                onSubmit={handleFileFormatSubmit}
                className="flex flex-col gap-4"
              >
                <div className="inline-block flex-wrap text-center whitespace-normal">
                  <span className="text-sm text-gray-300">Upload a&nbsp;</span>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <span className="inline-block cursor-help text-sm text-fr-1 underline underline-offset-2">
                          supported file (JSON/TXT)
                        </span>
                      }
                    />

                    <PopoverContent className="mx-8 max-h-80 w-80 space-y-4 overflow-y-auto rounded-sm border border-gray-200 bg-white p-4 text-sm shadow-md">
                      <h2 className="text-xl font-semibold text-gray-900">
                        Supported File Formats
                      </h2>

                      <div className="space-y-1">
                        <p>
                          <span className="font-medium text-gray-800">
                            JSON:
                          </span>{' '}
                          Should be a list of objects, each with an{' '}
                          <code className="rounded bg-gray-100 px-1 py-0.5 text-[0.85em]">
                            authorLink
                          </code>
                          .
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="font-medium text-gray-800">TXT:</p>
                        <ul className="ml-2 list-inside list-disc space-y-1 text-gray-700">
                          <li>
                            A plain author link, e.g.
                            <br />
                            <code className="rounded bg-gray-100 px-1 py-0.5 text-[0.85em] wrap-break-word">
                              https://forums.spacebattles.com/members/example.12345/
                            </code>
                          </li>
                          <li>
                            Or a line like:
                            <br />
                            <code className="rounded bg-gray-100 px-1 py-0.5 text-[0.85em] wrap-break-word">
                              Author Link:
                              https://forums.sufficientvelocity.com/members/example.12345/
                            </code>
                          </li>
                        </ul>
                      </div>

                      <p className="text-gray-700">
                        If you're using{' '}
                        <a
                          href="https://github.com/Jemeni11/TalesTrove"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-fr-1 underline"
                        >
                          TalesTrove
                        </a>
                        , you're all set. Its JSON and main TXT format are fully
                        supported.
                        <br />
                        <br />
                        LinksOnlyTXT format isn't supported because it contains
                        story links, not author profiles.
                      </p>
                    </PopoverContent>
                  </Popover>
                  <span className="text-sm text-gray-300">
                    .&nbsp;Only author links from XenForo forums are supported.
                  </span>
                </div>
                <input
                  id="file"
                  name="file"
                  type="file"
                  accept="application/json,text/plain"
                  disabled={isUploading}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setSelectedFileName(file.name)
                    }
                  }}
                />

                <Popover>
                  <PopoverTrigger
                    render={
                      <span className="w-full cursor-help text-center text-base font-medium text-yellow-600">
                        ⚠️ Caution
                      </span>
                    }
                  />
                  <PopoverContent className="mx-8 w-80 space-y-4 rounded-sm border border-yellow-300 bg-white p-4 text-sm shadow-md">
                    <h2 className="text-base font-semibold text-yellow-800">
                      File upload may fail in some browsers
                    </h2>

                    <p className="text-gray-700">
                      In some browsers, file inputs inside extension popups
                      often get cleared as soon as the popup loses focus — like
                      right after selecting a file.
                    </p>

                    <p className="text-gray-700">
                      If your upload keeps disappearing, try using Chrome/Edge,
                      or open the full upload page instead.
                    </p>

                    <button
                      className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-fr-1 py-1.5 text-center text-base text-white transition-colors hover:bg-fr-2"
                      onClick={() => {
                        void browser.tabs.create({
                          url: browser.runtime.getURL('/file-upload.html'),
                        })
                      }}
                    >
                      <span>Open Upload Page</span>
                      <LinkOutIcon className="size-4" />
                    </button>

                    <small className="mt-1 block w-full text-center text-xs text-gray-500 pointer-coarse:block pointer-fine:hidden">
                      Tab will open in background - close popup to view
                    </small>
                  </PopoverContent>
                </Popover>

                <label
                  htmlFor="file"
                  className={cn(
                    'w-full cursor-pointer rounded-3xl border-2 py-1.5 text-center text-lg transition-colors',
                    isUploading
                      ? 'cursor-not-allowed border-gray-500 text-gray-500'
                      : 'border-fr-1 text-fr-1 hover:bg-fr-1 hover:text-white',
                  )}
                >
                  {selectedFileName || 'Select File'}
                </label>

                <button
                  type="submit"
                  disabled={isUploading || !selectedFileName?.trim()}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-fr-1 py-1.5 text-center text-lg disabled:opacity-50"
                >
                  <span>{isUploading ? 'Processing…' : 'Upload & Scan'}</span>
                  <LinkOutIcon className="size-4" />
                </button>
              </form>
            </div>

            <div className="space-y-4 pointer-fine:hidden">
              <div className="space-y-2 text-center">
                <p className="font-medium text-yellow-600">
                  ⚠️ File uploads don't work reliably in mobile popups
                </p>
                <p className="text-sm text-gray-300">
                  Files get cleared when the popup loses focus. Use the full
                  upload page instead.
                </p>
              </div>

              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-fr-1 py-1.5 text-center text-lg text-white transition-colors hover:bg-fr-2"
                onClick={() => {
                  void browser.tabs.create({
                    url: browser.runtime.getURL('/file-upload.html'),
                  })
                }}
              >
                <span>Open Upload Page</span>
                <LinkOutIcon className="size-4" />
              </button>
            </div>
          </div>
        )}

        <small className="block w-full text-center text-xs text-white pointer-coarse:block pointer-fine:hidden">
          Tab will open in background - close popup to view
        </small>
      </div>

      <footer className="space-y-3 bg-fr-3 py-4 text-center text-sm text-white">
        <p>
          Made with <span className="text-red-500">❤️</span> by{' '}
          <a
            href="https://github.com/Jemeni11"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-fr-1 underline underline-offset-2"
          >
            Jemeni
          </a>
        </p>

        <div className="flex w-full items-center justify-center gap-4">
          <span>Support me on: </span>
          <p className="flex justify-center gap-2">
            <a
              href="https://www.buymeacoffee.com/jemeni11"
              target="_blank"
              rel="noopener noreferrer"
            >
              <BuyMeACoffeeIcon />
            </a>
            <a
              href="https://github.com/sponsors/Jemeni11"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GitHubSponsorsIcon />
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
