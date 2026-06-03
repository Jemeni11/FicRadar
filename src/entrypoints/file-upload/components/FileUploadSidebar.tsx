import cn from '@/utils/cn'

type FileUploadSidebarProps = {
  isSidebarOpen: boolean
  onCloseSidebar: () => void
  onToggleSidebar: () => void
}

export default function FileUploadSidebar({
  isSidebarOpen,
  onCloseSidebar,
  onToggleSidebar,
}: FileUploadSidebarProps) {
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
              Instructions
            </h2>
          </div>
        </div>

        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 text-sm text-fr-muted">
          <div className="mb-6">
            Upload a file with XenForo author profile links.
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-white">Supported File Types</h3>

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="font-medium text-white">📄 JSON</p>
                  <p className="text-[13px] leading-snug">
                    A list of objects, each with an{' '}
                    <code className="rounded bg-white/10 px-1 py-0.5 text-[0.85em] text-white">
                      authorLink
                    </code>{' '}
                    field.
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-medium text-white">📝 TXT</p>
                  <ul className="list-disc space-y-2 pl-4 text-[13px]">
                    <li>
                      Just the link:
                      <br />
                      <code className="mt-1 block rounded bg-white/10 px-1 py-0.5 text-[0.8em] break-all text-white">
                        https://forums.spacebattles.com/members/example.12345/
                      </code>
                    </li>
                    <li>
                      Or a line like:
                      <br />
                      <code className="mt-1 block rounded bg-white/10 px-1 py-0.5 text-[0.8em] break-all text-white">
                        Author Link:
                        https://forums.sufficientvelocity.com/members/example.12345/
                      </code>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-[12px] leading-tight text-white/50">
              TalesTrove export formats are fully supported.{' '}
              <span className="mt-1 block font-medium text-white/70">
                Note: story-only files (LinksOnlyTXT) won’t work.
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
