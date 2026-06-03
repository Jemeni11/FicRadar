import cn from '@/utils/cn'
import { handleGlobalExport } from '@/utils/export'

import type { AuthorStatus } from '@/types'

type AuthorSidebarProps = {
  authors: AuthorStatus[]
  selectedAuthorIndex: number
  completedCount: number
  isSidebarOpen: boolean
  onSelectAuthor: (index: number) => void
  onCloseSidebar: () => void
  onToggleSidebar: () => void
}

export default function AuthorSidebar({
  authors,
  selectedAuthorIndex,
  completedCount,
  isSidebarOpen,
  onSelectAuthor,
  onCloseSidebar,
  onToggleSidebar,
}: AuthorSidebarProps) {
  return (
    <>
      <button
        className={cn(
          'fixed top-4 left-4 z-30 flex size-10 items-center justify-center rounded-lg border border-white/10 bg-fr-surface text-fr-muted shadow-sm min-[600px]:hidden',
          'transition-[color,background-color,border-color] duration-150 ease-out',
          'hover:bg-white/5 hover:text-white focus-visible:ring-2 focus-visible:ring-fr-accent focus-visible:ring-offset-2 focus-visible:ring-offset-fr-3 focus-visible:outline-none',
        )}
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <svg
          className="size-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm transition-opacity duration-300 min-[600px]:hidden"
          onClick={onCloseSidebar}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-30 flex h-full flex-col bg-fr-surface shadow-2xl transition-all duration-300 ease-out min-[600px]:relative min-[600px]:translate-x-0 min-[600px]:shadow-none',
          isSidebarOpen
            ? 'visible w-80 translate-x-0 min-[600px]:w-72'
            : 'invisible w-80 -translate-x-full min-[600px]:visible min-[600px]:w-72',
        )}
      >
        <div className="sticky top-0 z-10 flex w-full flex-col gap-4 border-b border-white/5 bg-fr-surface/95 p-4 backdrop-blur-md">
          <button
            className={cn(
              'flex min-h-11 w-full items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-white min-[600px]:hidden',
              'transition-[background-color,border-color] duration-150 ease-out',
              'hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-fr-accent focus-visible:outline-none',
            )}
            type="button"
            onClick={onCloseSidebar}
          >
            Close Sidebar
          </button>

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-white">
              Authors
            </h2>
            <span className="rounded-md bg-white/5 px-2 py-1 text-xs font-medium text-fr-muted">
              {completedCount} / {authors.length}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-fr-accent transition-all duration-500 ease-out"
                style={{
                  width: `${authors.length > 0 ? (completedCount / authors.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {completedCount === authors.length && authors.length > 1 && (
            <div className="flex flex-col gap-1.5 pt-2">
              <label className="text-xs font-medium text-fr-muted">
                Export All Stories
              </label>
              <select
                className={cn(
                  'w-full cursor-pointer appearance-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white',
                  'transition-[border-color,background-color] duration-150 ease-out',
                  'hover:border-white/20 focus-visible:border-fr-accent focus-visible:ring-1 focus-visible:ring-fr-accent focus-visible:outline-none',
                )}
                onChange={(e) => {
                  const format = e.target.value
                  if (!format) return
                  handleGlobalExport(authors, format)
                  // Reset select
                  e.target.value = ''
                }}
              >
                <option value="" className="bg-fr-surface">
                  Select format…
                </option>
                <option value="txt" className="bg-fr-surface">
                  Download All as TXT
                </option>
                <option value="json" className="bg-fr-surface">
                  Download All as JSON
                </option>
                <option value="csv" className="bg-fr-surface">
                  Download All as CSV
                </option>
                <option value="html" className="bg-fr-surface">
                  Download All as HTML
                </option>
                <option value="bookmark" className="bg-fr-surface">
                  Download All as Bookmark HTML
                </option>
              </select>
            </div>
          )}
        </div>

        <ul className="flex-1 overflow-x-hidden overflow-y-auto p-2">
          {authors.map((author, idx) => {
            const isSelected = idx === selectedAuthorIndex
            return (
              <li key={author.url} className="mb-1 last:mb-0">
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-150 ease-out',
                    isSelected
                      ? 'bg-fr-accent/15 font-medium text-fr-accent'
                      : 'text-fr-muted hover:bg-white/5 hover:text-white',
                    'focus-visible:ring-2 focus-visible:ring-fr-accent focus-visible:outline-none focus-visible:ring-inset',
                  )}
                  onClick={() => {
                    onSelectAuthor(idx)
                    if (window.innerWidth < 450) {
                      onCloseSidebar()
                    }
                  }}
                  aria-selected={isSelected}
                  role="option"
                >
                  <span className="truncate">{author.name}</span>
                  <span
                    className={cn(
                      'shrink-0 text-xs',
                      isSelected ? 'text-fr-accent/80' : 'text-fr-muted/70',
                    )}
                  >
                    {author.status === 'queued' && 'Not started'}
                    {author.status === 'pending' && (
                      <span className="flex items-center gap-1.5">
                        <span className="size-1.5 animate-pulse rounded-full bg-fr-accent" />
                        Scraping
                      </span>
                    )}
                    {author.status === 'success' &&
                      `${author.stories.length} found`}
                    {author.status === 'error' && (
                      <span className="text-red-400">Error</span>
                    )}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </aside>
    </>
  )
}
