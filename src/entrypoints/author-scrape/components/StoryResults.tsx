import { useMemo, useState } from 'react'

import cn from '@/utils/cn'

import type { StoryResult } from '@/types'

type StoryResultsProps = {
  stories: StoryResult[]
  authorName: string
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'discovered', label: 'Discovered' },
  { value: 'authored', label: 'Authored' },
] as const

type FilterMode = (typeof FILTER_OPTIONS)[number]['value']

function AuthoredBadge({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700',
        className,
      )}
    >
      <svg
        className="size-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        <path d="m15 5 4 4" />
      </svg>
      Authored
    </span>
  )
}

function storyAriaLabel(story: StoryResult, authorName: string): string {
  return story.isAuthor
    ? `${story.title} — written by ${authorName}, ${story.count} interactions`
    : `${story.title}, ${story.count} interactions`
}

export default function StoryResults({
  stories,
  authorName,
}: StoryResultsProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredStories = useMemo(() => {
    let result = stories

    if (filterMode === 'authored') {
      result = result.filter((s) => s.isAuthor)
    } else if (filterMode === 'discovered') {
      result = result.filter((s) => !s.isAuthor)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter((s) => s.title.toLowerCase().includes(q))
    }

    return result
  }, [stories, filterMode, searchQuery])

  const authoredCount = useMemo(
    () => stories.filter((s) => s.isAuthor).length,
    [stories],
  )

  return (
    <>
      {/* Toolbar: stats, filter, search, view toggle */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            <span className="tabular-nums">{stories.length}</span> stories found
            {authoredCount > 0 && (
              <span>
                {' '}
                · <span className="tabular-nums">{authoredCount}</span> authored
              </span>
            )}
          </p>

          <div className="flex rounded-md bg-gray-200 p-0.5">
            <button
              type="button"
              aria-label="List view"
              onClick={() => setViewMode('list')}
              className={cn(
                'rounded-sm p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none',
                viewMode === 'list'
                  ? 'bg-white font-medium text-purple-700 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-300 hover:text-gray-800',
              )}
            >
              <svg
                className="size-4"
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
            <button
              type="button"
              aria-label="Grid view"
              onClick={() => setViewMode('grid')}
              className={cn(
                'rounded-sm p-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none',
                viewMode === 'grid'
                  ? 'bg-white font-medium text-purple-700 shadow-sm'
                  : 'text-gray-500 hover:bg-gray-300 hover:text-gray-800',
              )}
            >
              <svg
                className="size-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M4 6h4v4H4V6zm12 0h4v4h-4V6zM4 14h4v4H4v-4zm12 0h4v4h-4v-4z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Filter toggle */}
          <div
            role="radiogroup"
            aria-label="Filter stories"
            className="flex w-fit rounded-md bg-gray-200 p-0.5 text-xs"
          >
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={filterMode === opt.value}
                onClick={() => setFilterMode(opt.value)}
                className={cn(
                  'cursor-pointer rounded-sm px-3 py-1 transition-colors focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none',
                  filterMode === opt.value
                    ? 'bg-white font-medium text-purple-700 shadow-sm'
                    : 'text-gray-500 hover:bg-gray-300 hover:text-gray-800',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="search"
              placeholder="Search stories…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white py-1.5 pr-3 pl-8 text-xs text-gray-800 placeholder:text-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-400 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {filteredStories.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">
          No stories match your filters.
        </p>
      ) : viewMode === 'list' ? (
        <div
          className="flex flex-col gap-1 text-sm"
          style={{ contentVisibility: 'auto' }}
        >
          {filteredStories.map((story, idx) => (
            <a
              key={story.link}
              href={story.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={storyAriaLabel(story, authorName)}
              className="group flex items-start justify-between rounded-md py-2 transition-colors hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none md:p-2"
            >
              <span className="mr-3 w-8 shrink-0 pt-0.5 text-center font-medium text-gray-400 tabular-nums md:w-6 md:text-right">
                {idx + 1}.
              </span>
              <span className="mr-4 line-clamp-3 min-w-0 flex-1 pt-0.5 text-balance text-blue-700 group-hover:underline">
                {story.title}
              </span>
              <span className="mt-0.5 flex shrink-0 items-center gap-2">
                {story.isAuthor && <AuthoredBadge />}
                <span className="min-w-[6ch] rounded-full bg-gray-200 px-2 py-0.5 text-center text-xs font-medium text-gray-700 tabular-nums">
                  {story.count}
                </span>
              </span>
            </a>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 text-sm lg:grid-cols-2 xl:grid-cols-3">
          {filteredStories.map((story) => (
            <a
              key={story.link}
              href={story.link}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={storyAriaLabel(story, authorName)}
              className={cn(
                'group flex flex-col justify-between rounded-lg border bg-white p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:outline-none',
                story.isAuthor
                  ? 'border-purple-200 bg-purple-50/30'
                  : 'border-gray-200 hover:border-gray-300',
              )}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className="line-clamp-3 font-medium text-balance text-blue-700 group-hover:underline">
                  {story.title}
                </span>
                {story.isAuthor && (
                  <AuthoredBadge className="mt-0.5 shrink-0" />
                )}
              </div>
              <span className="self-end rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700 tabular-nums">
                {story.count}
              </span>
            </a>
          ))}
        </div>
      )}
    </>
  )
}
