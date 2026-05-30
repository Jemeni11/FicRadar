import { useRef, useState } from 'react'

import { storage } from '#imports'

import { LinkOutIcon } from '@/icons'
import cn from '@/utils/cn'

import type { TalesTroveJSONType } from '@/types'

type FileUploadFormProps = {
  setError: (error: string | null) => void
  setSuccess: (success: string | null) => void
}

export default function FileUploadForm({
  setError,
  setSuccess,
}: FileUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      setError('Select a valid JSON or TXT file.')
      setIsUploading(false)
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
          throw new Error('No valid author links found in TXT file.')
        }

        stories = links
      }

      await storage.setItem<string[]>('local:batchAuthorStories', stories)

      setSuccess('File processed. Opening scanner…')

      void browser.tabs.create({
        url: browser.runtime.getURL('/author-scrape.html'),
      })
    } catch (err) {
      console.error('File upload failed:', err)
      setError(
        err instanceof Error
          ? err.message
          : "Couldn't read that file. Upload a valid TalesTrove JSON or a supported TXT file.",
      )
    }

    setIsUploading(false)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Desktop file upload form */}
      <div className="pointer-coarse:hidden">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="flex flex-col gap-3"
        >
          <p className="text-center text-sm text-pretty text-fr-muted">
            Upload a JSON or TXT file with author profile links.{' '}
            <a
              href="https://github.com/Jemeni11/TalesTrove"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fr-accent underline underline-offset-2 transition-[color] duration-150 hover:text-white"
            >
              TalesTrove
            </a>{' '}
            exports are supported.
          </p>

          <input
            id="file"
            name="file"
            type="file"
            accept="application/json,text/plain"
            disabled={isUploading}
            aria-label="Select a JSON or TXT file"
            className="peer sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setSelectedFileName(file.name)
              }
            }}
          />

          <label
            htmlFor="file"
            className={cn(
              'flex min-h-11 w-full cursor-pointer items-center justify-center rounded-3xl border-2 text-center text-base font-medium',
              'transition-[color,background-color,border-color] duration-150 ease-out',
              'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-fr-accent',
              isUploading
                ? 'cursor-not-allowed border-white/10 text-fr-muted'
                : 'border-fr-accent/50 text-fr-accent hover:border-fr-accent hover:bg-fr-accent/10',
            )}
          >
            <span className={cn(selectedFileName && 'truncate px-3')}>
              {selectedFileName || 'Select File'}
            </span>
          </label>

          <button
            type="submit"
            disabled={isUploading || !selectedFileName?.trim()}
            aria-busy={isUploading}
            className={cn(
              'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-3xl bg-fr-1 text-center text-base font-medium text-white',
              'transition-[transform,background-color] duration-150 ease-out',
              'hover:bg-fr-accent',
              'active:scale-[0.97]',
              'disabled:pointer-events-none disabled:opacity-50',
            )}
          >
            <span>{isUploading ? 'Processing…' : 'Upload & Scan'}</span>
            <LinkOutIcon className="size-4" />
          </button>

          <p className="text-center text-xs text-pretty text-fr-muted">
            Upload not working?{' '}
            <button
              type="button"
              className="text-fr-accent underline underline-offset-2 transition-[color] duration-150 hover:text-white"
              onClick={() => {
                void browser.tabs.create({
                  url: browser.runtime.getURL('/file-upload.html'),
                })
              }}
            >
              Open the full upload page
            </button>{' '}
            instead.
          </p>
        </form>
      </div>

      {/* Mobile fallback — file uploads don't work reliably in mobile popups */}
      <div className="space-y-3 pointer-fine:hidden">
        <p className="text-center text-sm text-pretty text-fr-muted">
          File uploads don't work reliably in mobile popups. Use the full upload
          page instead.
        </p>

        <button
          type="button"
          className={cn(
            'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-3xl bg-fr-1 text-center text-base font-medium text-white',
            'transition-[transform,background-color] duration-150 ease-out',
            'hover:bg-fr-accent',
            'active:scale-[0.97]',
          )}
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
  )
}
