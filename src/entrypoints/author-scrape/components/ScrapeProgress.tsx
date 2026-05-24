import { useEffect, useRef } from 'react'

import type { LogEntry, ProgressData } from '@/types'

type ScrapeProgressProps = {
  authorName: string
  authorProgressData: ProgressData
  progressData: ProgressData
  logs: LogEntry[]
}

export default function ScrapeProgress({
  authorName,
  authorProgressData,
  progressData,
  logs,
}: ScrapeProgressProps) {
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(
    () => logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }),
    [logs],
  )

  return (
    <>
      <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="relative flex size-4 items-center justify-center">
              <svg
                className="absolute size-4 animate-spin text-purple-600"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900">
              Finding stories by {authorName}…
            </h3>
          </div>
        </div>

        <div className="flex flex-col p-4 sm:flex-row sm:gap-6">
          {/* Authored Threads Progress */}
          <div className="flex-1">
            <div className="mb-2 flex items-end justify-between">
              <div>
                <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Authored Works
                </div>
                <div className="mt-0.5 text-xs text-gray-400">
                  Scanning profile history
                </div>
              </div>
              <div className="text-right tabular-nums">
                <span className="text-sm font-medium text-gray-900">
                  {authorProgressData.page}
                </span>
                <span className="text-xs text-gray-400">
                  /{Math.max(authorProgressData.totalPages, 1)}
                </span>
              </div>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100"
              role="progressbar"
              aria-valuenow={authorProgressData.page}
              aria-valuemin={0}
              aria-valuemax={Math.max(authorProgressData.totalPages, 1)}
              aria-label="Authored threads scanning progress"
            >
              <div
                className="h-full origin-left bg-purple-500 transition-transform duration-300 ease-out"
                style={{
                  transform: `scaleX(${
                    authorProgressData.page /
                    Math.max(authorProgressData.totalPages, 1)
                  })`,
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-gray-500">Threads found</span>
              <span className="font-medium text-purple-700 tabular-nums">
                {authorProgressData.found}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 h-px bg-gray-100 sm:my-0 sm:block sm:w-px sm:shrink-0"></div>

          {/* Discovered Threads Progress */}
          <div className="flex-1">
            <div className="mb-2 flex items-end justify-between">
              <div>
                <div className="text-xs font-semibold tracking-wider text-gray-500 uppercase">
                  Forum Search
                </div>
                <div className="mt-0.5 text-xs text-gray-400">
                  Scanning search results
                </div>
              </div>
              <div className="text-right tabular-nums">
                <span className="text-sm font-medium text-gray-900">
                  {progressData.page}
                </span>
                <span className="text-xs text-gray-400">
                  /{Math.max(progressData.totalPages, 1)}
                </span>
              </div>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100"
              role="progressbar"
              aria-valuenow={progressData.page}
              aria-valuemin={0}
              aria-valuemax={Math.max(progressData.totalPages, 1)}
              aria-label="Global mentions scanning progress"
            >
              <div
                className="h-full origin-left bg-purple-500 transition-transform duration-300 ease-out"
                style={{
                  transform: `scaleX(${
                    progressData.page /
                    Math.max(progressData.totalPages, 1)
                  })`,
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-gray-500">Threads found</span>
              <span className="font-medium text-purple-700 tabular-nums">
                {progressData.found}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="my-6 flex h-64 flex-col overflow-hidden rounded-md border border-gray-800 bg-[#0d1117] font-mono text-xs text-gray-300 shadow-inner">
        <div className="flex items-center border-b border-gray-700 bg-gray-800 px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase select-none">
          <span>logs — {authorName}</span>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto p-3 font-mono leading-relaxed [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-track]:bg-[#0d1117]">
          {logs.length === 0 && (
            <div className="text-gray-600 italic">Waiting for logs…</div>
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
  )
}
