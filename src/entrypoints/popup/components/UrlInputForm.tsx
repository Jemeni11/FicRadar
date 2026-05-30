import { useState } from 'react'

import { storage } from '#imports'

import { LinkOutIcon } from '@/icons'
import cn from '@/utils/cn'
import { isValidURL } from '@/utils/url'

type UrlInputFormProps = {
  setError: (error: string | null) => void
  setSuccess: (success: string | null) => void
}

export default function UrlInputForm({
  setError,
  setSuccess,
}: UrlInputFormProps) {
  const [currentUrl, setCurrentUrl] = useState('')
  const [urlError, setUrlError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)

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
          setUrlError('Enter a valid URL')
        }
      }
    } else {
      setUrlError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    await storage.removeItem('local:batchAuthorStories')
    await storage.removeItem('local:singleAuthorURL')

    setError(null)
    setSuccess(null)
    setIsScanning(true)

    try {
      if (!isValidURL(currentUrl)) {
        setError('Enter a valid and supported URL.')
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label htmlFor="url">
        <span className="sr-only">Author profile URL</span>
        <input
          type="url"
          id="url"
          name="url"
          autoComplete="url"
          spellCheck={false}
          value={currentUrl}
          onChange={handleUrlChange}
          placeholder="Paste an author's profile URL…"
          aria-invalid={urlError ? true : undefined}
          aria-describedby={urlError ? 'url-error' : undefined}
          className={cn(
            'mt-0.5 w-full rounded-3xl bg-fr-surface text-sm text-white shadow-sm',
            'placeholder:text-fr-muted',
            'border',
            urlError ? 'border-red-400/50' : 'border-white/10',
          )}
        />
      </label>
      {urlError && (
        <p id="url-error" className="text-sm text-red-400" role="alert">
          {urlError}
        </p>
      )}
      <button
        type="submit"
        disabled={isScanning || !currentUrl.trim() || !!urlError}
        aria-busy={isScanning}
        className={cn(
          'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-3xl bg-fr-1 text-center text-base font-medium text-white',
          'transition-[transform,background-color] duration-150 ease-out',
          'hover:bg-fr-accent',
          'active:scale-[0.97]',
          'disabled:pointer-events-none disabled:opacity-50',
        )}
      >
        <span>{isScanning ? 'Scanning…' : 'Scan Link'}</span>
        <LinkOutIcon className="size-4" />
      </button>
    </form>
  )
}
