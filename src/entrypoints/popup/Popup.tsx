import { useCallback, useState } from 'react'

import { AlertCircleIcon, CheckCircleIcon, InfoIcon } from '@/icons'
import cn from '@/utils/cn'

import FileUploadForm from './components/FileUploadForm'
import PopupFooter from './components/PopupFooter'
import PopupHeader from './components/PopupHeader'
import UrlInputForm from './components/UrlInputForm'

import type { InputMethod } from '@/types'

import '@/assets/tailwind.css'

const TABS = [
  { value: 'paste' as const, label: 'Paste a Link', id: 'tab-paste' },
  { value: 'file' as const, label: 'Upload a File', id: 'tab-file' },
]

const PANEL_ID = 'input-panel'

export default function Popup() {
  const [inputMethod, setInputMethod] = useState<InputMethod>('paste')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const activeIndex = TABS.findIndex((t) => t.value === inputMethod)
  const activeTab = TABS[activeIndex]

  const handleTabKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault()
        const nextIndex =
          e.key === 'ArrowRight'
            ? (activeIndex + 1) % TABS.length
            : (activeIndex - 1 + TABS.length) % TABS.length
        const nextTab = TABS[nextIndex]
        setInputMethod(nextTab.value)

        const nextButton = document.getElementById(nextTab.id)
        nextButton?.focus()
      }
    },
    [activeIndex],
  )

  return (
    <div className="min-h-full w-full pointer-coarse:min-w-fit pointer-fine:w-96">
      <PopupHeader />

      <main className="flex flex-col gap-3 bg-fr-3 px-4 py-4 text-white">
        {/* Tab switcher */}
        <div
          role="tablist"
          aria-label="Choose input method"
          className="relative flex w-full rounded-3xl border border-solid border-white/10 bg-fr-surface p-1.5"
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
              id={tab.id}
              type="button"
              role="tab"
              aria-selected={inputMethod === tab.value}
              aria-controls={PANEL_ID}
              tabIndex={inputMethod === tab.value ? 0 : -1}
              className={cn(
                'relative z-10 min-h-11 w-full flex-1 rounded-[18px] text-center text-sm font-medium',
                'transition-[color,opacity] duration-150 ease-out',
                'active:scale-[0.97]',
                inputMethod === tab.value
                  ? 'text-white'
                  : 'text-fr-muted hover:text-white/80',
              )}
              onClick={() => setInputMethod(tab.value)}
              onKeyDown={handleTabKeyDown}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div
            role="alert"
            aria-live="assertive"
            className="flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-950/50 p-3 text-sm text-red-300"
          >
            <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-start gap-2 rounded-lg border border-emerald-400/30 bg-emerald-950/50 p-3 text-sm text-emerald-300"
          >
            <CheckCircleIcon className="mt-0.5 size-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Mobile-only context notice */}
        <div className="hidden items-center justify-center gap-1.5 rounded-lg bg-fr-surface px-3 py-2 pointer-coarse:flex pointer-fine:hidden">
          <InfoIcon className="size-3.5 shrink-0 text-fr-muted" />
          <p className="text-xs text-fr-muted">
            Tab opens in background — close popup to view
          </p>
        </div>

        <div
          id={PANEL_ID}
          role="tabpanel"
          aria-labelledby={activeTab.id}
          tabIndex={0}
        >
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
