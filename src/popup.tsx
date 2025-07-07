import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { InputMethod, TalesTroveJSONType } from "@/types"
import { isValidURL } from "@/utils"
import { useRef, useState } from "react"

import { Storage } from "@plasmohq/storage"

import "./style.css"

import { cn } from "./lib/utils"

const storage = new Storage({ area: "local" })

export default function Popup() {
  const [isUploading, setIsUploading] = useState(false)
  const [isScanning, setIsScanning] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [urlError, setUrlError] = useState<string | null>(null)
  const [currentUrl, setCurrentUrl] = useState("")

  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  const [inputMethod, setInputMethod] = useState<InputMethod>("paste")

  const formRef = useRef<HTMLFormElement | null>(null)

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setCurrentUrl(url)

    if (url.trim() === "") {
      setUrlError(null)
      return
    }

    if (!isValidURL(url)) {
      if (!url.startsWith("http")) {
        setUrlError("URL must start with http:// or https://")
      } else {
        try {
          const hostname = new URL(url).hostname
          setUrlError(
            `${hostname} is not supported. Only QuestionableQuesting, SpaceBattles, and SufficientVelocity are supported.`,
          )
        } catch {
          setUrlError("Please enter a valid URL")
        }
      }
    } else {
      setUrlError(null)
    }
  }

  const handleFileFormatSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault()

    await storage.remove("batchAuthorStories")
    await storage.remove("singleAuthorURL")

    setError(null)
    setSuccess(null)

    setIsUploading(true)

    const form = formRef.current
    if (!form) {
      throw new Error("Form not available")
    }

    const fileInput = form.elements.namedItem("file") as HTMLInputElement | null
    const file = fileInput?.files?.[0] ?? null

    if (!file || !["application/json", "text/plain"].includes(file.type)) {
      setError("Please select a valid file.")
      return
    }

    try {
      let stories: string | string[]
      const text = await file.text()

      if (file.type === "application/json") {
        const parsed = JSON.parse(text)

        if (!Array.isArray(parsed)) {
          throw new Error("Uploaded JSON file does not contain a valid array.")
        }

        const isValid = parsed.every(
          (item): item is TalesTroveJSONType =>
            typeof item.authorLink === "string",
        )

        if (!isValid) {
          throw new Error("Uploaded JSON has invalid structure.")
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

          // TalesTrove format: `Author Link: https://...`
          else if (trimmed.startsWith("Author Link:")) {
            const link = trimmed.replace("Author Link:", "").trim()
            if (/^https?:\/\/\S+$/.test(link)) {
              links.push(link)
            }
          }
        }

        if (links.length === 0) {
          throw new Error("No valid story links found in TXT file.")
        }

        stories = links
      }

      await storage.set("batchAuthorStories", stories)

      setSuccess("File processed successfully! Opening scanner...")

      chrome.tabs.create({
        url: chrome.runtime.getURL("./tabs/author-scrape.html"),
      })
    } catch (err) {
      console.error("File upload failed:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Invalid file format. Please upload a proper TalesTrove XenForo JSON or a TXT file.",
      )
    }

    setIsUploading(false)
  }

  const handleInputFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    await storage.remove("batchAuthorStories")
    await storage.remove("singleAuthorURL")

    setError(null)
    setSuccess(null)
    setIsScanning(true)

    try {
      if (!isValidURL(currentUrl)) {
        setError("Please enter a valid and supported URL.")
        return
      }

      await storage.set("singleAuthorURL", currentUrl)

      setSuccess("Opening scanner...")
      chrome.tabs.create({
        url: chrome.runtime.getURL("./tabs/author-scrape.html"),
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Try again.",
      )
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="w-96 min-h-96">
      <div className="w-full aspect-video bg-[linear-gradient(90deg,#141142,#4143c7)]"></div>

      <div className="p-4 flex flex-col gap-8 bg-fr-3 h-full text-white">
        <h1 className="text-6xl text-center font-bold">FicRadar</h1>
        <ToggleGroup
          type="single"
          className="border-fr-1 rounded-3xl p-1.5 flex w-full border border-solid"
          value={inputMethod}
          onValueChange={(value) => {
            if (value) {
              setInputMethod(value as InputMethod)
            }
          }}>
          <ToggleGroupItem
            value="paste"
            className={cn(
              inputMethod === "paste" && "rounded-3xl bg-fr-1",
              "w-full text-center transition-colors",
            )}>
            Paste a Link
          </ToggleGroupItem>
          <ToggleGroupItem
            value="file"
            className={cn(
              inputMethod === "file" && "rounded-3xl bg-fr-1",
              "w-full text-center transition-colors",
            )}>
            Upload a File
          </ToggleGroupItem>
        </ToggleGroup>

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 text-red-200">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/50 border border-green-500 rounded-lg p-3 text-green-200">
            {success}
          </div>
        )}

        {inputMethod === "paste" ? (
          <form
            onSubmit={handleInputFormSubmit}
            className="flex flex-col gap-4">
            <label htmlFor="url">
              <input
                type="url"
                id="url"
                value={currentUrl}
                onChange={handleUrlChange}
                placeholder="Enter author's profile URL"
                className={cn(
                  "mt-0.5 w-full rounded-3xl shadow-sm sm:text-sm bg-gray-900 text-white",
                  urlError ? "border-red-500" : "border-fr-1",
                )}
              />
            </label>
            {urlError && (
              <p className="text-red-400 text-sm mt-1">{urlError}</p>
            )}
            <button
              type="submit"
              disabled={isScanning || !currentUrl.trim() || !!urlError}
              className="w-full rounded-3xl text-lg bg-fr-1 text-center py-1.5 disabled:opacity-50">
              {isScanning ? "Scanning..." : "Scan Link"}
            </button>
          </form>
        ) : (
          <form
            ref={formRef}
            onSubmit={handleFileFormatSubmit}
            className="flex flex-col gap-4">
            <p className="text-sm text-gray-300">
              Upload a{" "}
              <a
                href="https://github.com/Jemeni11/TalesTrove"
                target="_blank"
                rel="noopener noreferrer"
                className="text-fr-1 hover:underline">
                TalesTrove
              </a>{" "}
              JSON/TXT file. Only XenForo Sites are supported.
            </p>

            <input
              id="file"
              name="file"
              type="file"
              accept="application/json,text/plain"
              disabled={isUploading}
              className="hidden"
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
                "w-full rounded-3xl text-lg text-center py-1.5 border-2 cursor-pointer transition-colors",
                isUploading
                  ? "border-gray-500 text-gray-500 cursor-not-allowed"
                  : "border-fr-1 text-fr-1 hover:bg-fr-1 hover:text-white",
              )}>
              {selectedFileName || "Choose File"}
            </label>

            <button
              type="submit"
              disabled={isUploading || !selectedFileName?.trim()}
              className="w-full rounded-3xl text-lg bg-fr-1 text-center py-1.5 disabled:opacity-50">
              {isUploading ? "Processing..." : "Upload & Scan"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
