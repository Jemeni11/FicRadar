import { useState } from 'react'

import cn from '@/utils/cn'

import FileUploadForm from './components/FileUploadForm'
import PopupFooter from './components/PopupFooter'
import PopupHeader from './components/PopupHeader'
import UrlInputForm from './components/UrlInputForm'

import type { InputMethod } from '@/types'

import '@/assets/tailwind.css'

const TABS = [
  { value: 'paste' as const, label: 'Paste a Link' },
  { value: 'file' as const, label: 'Upload a File' },
]

export default function Popup() {
  const [inputMethod, setInputMethod] = useState<InputMethod>('paste')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const activeIndex = TABS.findIndex((t) => t.value === inputMethod)

  return (
    <div className="min-h-full w-full pointer-fine:w-96">
      <PopupHeader />

      <main className="flex flex-col gap-3 bg-fr-3 px-4 py-3 text-white">
        <div
          role="tablist"
          aria-label="Choose input method"
          className="relative flex w-full rounded-3xl border border-solid border-fr-1 p-1.5"
        >
          {/* Sliding indicator */}
          <div
            aria-hidden="true"
            className={cn(
              'absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] rounded-[18px] bg-fr-1 transition-transform duration-200 ease-out',
              activeIndex === 1 && 'translate-x-full',
            )}
          />

          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={inputMethod === tab.value}
              className="relative z-10 w-full flex-1 text-center text-sm active:scale-[0.97]"
              onClick={() => setInputMethod(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-500 bg-red-900/50 p-3 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-lg border border-green-500 bg-green-900/50 p-3 text-sm text-green-200"
          >
            {success}
          </div>
        )}

        <small className="block w-full text-center text-xs text-white pointer-coarse:block pointer-fine:hidden">
          Tab will open in background — close popup to view
        </small>

        <div role="tabpanel">
          {inputMethod === 'paste' ? (
            <UrlInputForm setError={setError} setSuccess={setSuccess} />
          ) : (
            <FileUploadForm setError={setError} setSuccess={setSuccess} />
          )}
        </div>
      </main>

      <PopupFooter />
    </div>
  )
}
