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
      {/* Mobile toggle button */}
      <button
        className="fixed top-4 left-4 z-30 rounded-md bg-gray-800 p-2 text-white min-[450px]:hidden"
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

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="bg-opacity-50 fixed inset-0 z-20 bg-black min-[450px]:hidden"
          onClick={onCloseSidebar}
        />
      )}

      <aside
        className={` ${isSidebarOpen ? 'visible translate-x-0' : 'invisible -translate-x-full min-[450px]:visible'} fixed z-30 flex h-full flex-col border-r border-gray-200 bg-gray-50 transition-transform duration-300 ease-in-out min-[450px]:relative min-[450px]:translate-x-0 ${isSidebarOpen ? 'w-full min-[450px]:w-64' : 'w-0 min-[450px]:w-64'} `}
      >
        <div className="sticky top-0 z-10 w-full space-y-4 border-b bg-gray-50 pb-4">
          <button
            className="mx-[5%] my-2 w-[90%] rounded-md bg-red-700 px-4 py-2 text-xl font-bold text-white min-[450px]:hidden"
            type="button"
            onClick={onCloseSidebar}
          >
            Close Sidebar
          </button>
          <div className="border-b p-4 text-lg font-bold">Authors</div>
          <div className="my-8 px-4 text-sm text-gray-600">
            Progress: {completedCount}/{authors.length}
            <div className="my-2 h-2 w-full rounded bg-gray-200">
              <div
                className="h-full rounded bg-purple-500 transition-all duration-300"
                style={{
                  width: `${(completedCount / authors.length) * 100}%`,
                }}
              />
            </div>
          </div>
          {completedCount === authors.length && authors.length > 1 && (
            <div className="mb-6 px-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Export All Stories
              </label>
              <select
                className="w-full rounded border bg-white px-3 py-2 text-sm"
                onChange={(e) => {
                  const format = e.target.value
                  if (!format) return
                  handleGlobalExport(authors, format)
                }}
              >
                <option value="">Select format</option>
                <option value="txt">Download All as TXT</option>
                <option value="json">Download All as JSON</option>
                <option value="csv">Download All as CSV</option>
                <option value="html">Download All as HTML</option>
                <option value="bookmark">Download All as Bookmark HTML</option>
              </select>
            </div>
          )}
        </div>
        <ul className="flex-1 overflow-auto">
          {authors.map((author, idx) => (
            <li
              key={author.url}
              className={cn(
                'flex cursor-pointer items-center justify-between border-b p-3 text-sm transition hover:bg-gray-200',
                idx === selectedAuthorIndex && 'bg-purple-100 font-semibold',
              )}
              onClick={() => {
                onSelectAuthor(idx)
                if (window.innerWidth < 450) {
                  onCloseSidebar()
                }
              }}
            >
              <span>{author.name}</span>
              <span className="text-xs text-gray-500">
                {author.status === 'queued' && '🟡 Not started'}
                {author.status === 'pending' && '⏳ Loading'}
                {author.status === 'success' &&
                  `${author.stories.length} stories`}
                {author.status === 'error' && '❌'}
              </span>
            </li>
          ))}
        </ul>
      </aside>
    </>
  )
}
