import type { TalesTroveJSONType } from "@/types"
import { useRef, useState } from "react"

import { Storage } from "@plasmohq/storage"

import "../style.css"

import { cn } from "@/lib/utils"

const storage = new Storage({ area: "local" })

const parseTextToLinks = (text: string): string[] => {
  const lines = text.split(/\r?\n/)
  const links: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (/^https?:\/\/\S+$/.test(trimmed)) {
      links.push(trimmed)
    } else if (trimmed.startsWith("Author Link:")) {
      const link = trimmed.replace("Author Link:", "").trim()
      if (/^https?:\/\/\S+$/.test(link)) {
        links.push(link)
      }
    }
  }

  return links
}

export default function FileUploadTab() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsUploading(true)

    await storage.remove("batchAuthorStories")
    await storage.remove("singleAuthorURL")

    const file = fileInputRef.current?.files?.[0]
    if (!file || !["application/json", "text/plain"].includes(file.type)) {
      setError("Please select a valid JSON or TXT file.")
      setIsUploading(false)
      return
    }

    try {
      let links: string[]
      const text = await file.text()

      if (file.type === "application/json") {
        const parsed = JSON.parse(text)
        if (!Array.isArray(parsed)) {
          throw new Error("Uploaded JSON file is not an array.")
        }
        const isValid = parsed.every(
          (item): item is TalesTroveJSONType =>
            typeof item.authorLink === "string",
        )
        if (!isValid) throw new Error("JSON structure is invalid.")
        links = parsed.map((item) => item.authorLink)
      } else {
        links = parseTextToLinks(text)
        if (links.length === 0) {
          throw new Error("No valid author links found in TXT file.")
        }
      }

      await storage.set("batchAuthorStories", links)
      setSuccess("File processed! Redirecting...")

      setTimeout(() => {
        chrome.tabs.update({
          url: chrome.runtime.getURL("tabs/author-scrape.html"),
        })
      }, 1000)
    } catch (err) {
      console.error("File upload error:", err)
      setError(
        err instanceof Error ? err.message : "Invalid file format or content.",
      )
      setIsUploading(false)
    }
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="sticky top-0 bg-gray-50 z-10 border-b pb-4">
          <div className="p-4 font-bold text-lg border-b">Upload</div>

          <div className="my-6 px-4 text-sm text-gray-600">
            Upload a file with XenForo author profile links.
          </div>

          <div className="px-4 text-sm text-gray-700 space-y-6 pb-4">
            <div className="space-y-3">
              <h2 className="font-semibold text-gray-800 text-sm tracking-wide uppercase">
                Supported File Types
              </h2>

              <div className="bg-white border border-gray-200 rounded-md p-3 text-sm space-y-3">
                <div className="space-y-1">
                  <p className="font-medium text-gray-800">📄 JSON</p>
                  <p className="text-gray-600 leading-snug text-[13px]">
                    A list of objects, each with an{" "}
                    <code className="bg-gray-100 px-1 py-0.5 rounded text-[0.85em]">
                      authorLink
                    </code>{" "}
                    field.
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="font-medium text-gray-800">📝 TXT</p>
                  <ul className="space-y-1 pl-4 list-disc text-[13px] text-gray-600">
                    <li>
                      Just the link:
                      <br />
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-[0.8em] break-words">
                        https://forums.spacebattles.com/members/example.12345/
                      </code>
                    </li>
                    <li>
                      Or a line like:
                      <br />
                      <code className="bg-gray-100 px-1 py-0.5 rounded text-[0.8em] break-words">
                        Author Link:
                        https://forums.sufficientvelocity.com/members/example.12345/
                      </code>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-[12px] text-gray-500 leading-tight">
              TalesTrove export formats are fully supported.{" "}
              <span className="block mt-1">
                <strong>Note:</strong> story-only files (LinksOnlyTXT) won’t
                work.
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8 bg-white">
        <h1 className="text-2xl font-bold mb-6">FicRadar File Upload</h1>

        <form onSubmit={handleFileSubmit} className="space-y-4 w-full max-w-md">
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            id="file"
            type="file"
            accept="application/json,text/plain"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) setSelectedFileName(file.name)
            }}
          />

          {/* Label styled like a button */}
          <label
            htmlFor="file"
            className={cn(
              "w-full block rounded-3xl text-lg text-center py-1.5 border-2 cursor-pointer transition-colors",
              isUploading
                ? "border-gray-500 text-gray-500 cursor-not-allowed"
                : "border-fr-1 text-fr-1 hover:bg-fr-1 hover:text-white",
            )}>
            {selectedFileName || "Choose File"}
          </label>

          {/* Feedback */}
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}

          {/* Upload button */}
          <button
            type="submit"
            disabled={isUploading || !selectedFileName?.trim()}
            className="w-full rounded-3xl text-lg bg-fr-1 text-center py-1.5 text-white disabled:opacity-75">
            {isUploading ? "Processing..." : "Upload & Scan"}
          </button>
        </form>
      </main>
    </div>
  )
}
