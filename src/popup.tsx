import { Progress } from "@/components/ui/progress"
import type {
  ProgressData,
  ScrapeRequest,
  ScrapeResponse,
  storyObject,
  SupportedSites
} from "@/types"
import { extractUsername, sortByCountDescending } from "@/utils"
import { useEffect, useState } from "react"

import { usePort } from "@plasmohq/messaging/hook"
import { Storage } from "@plasmohq/storage"

import "@/style.css"

export default function FicRadar() {
  const [progress, setProgress] = useState<ProgressData>({
    page: 0,
    totalPages: 0,
    found: 0
  })
  const [inputState, setInputState] = useState("")
  const [stories, setStories] = useState<storyObject[]>([])
  const storage = new Storage({ area: "local" })

  const { data, send } = usePort<ScrapeRequest, ScrapeResponse>("scrape")

  const map: Record<string, SupportedSites> = {
    "forum.questionablequesting.com": "QuestionableQuesting",
    "forums.spacebattles.com": "SpaceBattles",
    "forums.sufficientvelocity.com": "SufficientVelocity"
  }

  useEffect(() => {
    const handleData = async () => {
      if (!data) return

      if ("progress" in data) {
        setProgress(data.progress)
      } else if ("done" in data) {
        const sorted = sortByCountDescending(data.data)
        const userName = extractUsername(inputState)
        setStories(sorted)

        await storage.set("ficradarData", {
          author: userName,
          stories: sorted
        })
        console.log(sorted)
      } else if ("error" in data) {
        console.error(data.error)
      }
    }

    handleData()
  }, [data])

  useEffect(() => {
    return () => {
      storage.remove("ficradarData")
    }
  }, [])

  function handleClick() {
    const hostname = new URL(inputState).hostname
    const id = map[hostname]

    if (!id) {
      console.error("Unsupported site")
      return
    }

    send({ id, url: inputState })
  }

  return (
    <div className="flex flex-col p-10 gap-6 min-h-32 w-96">
      <h1 className="text-3xl font-bold">FicRadar</h1>
      <div className="flex w-full gap-4 flex-col">
        <input
          type="url"
          name="url"
          id="url"
          value={inputState}
          onChange={(e) => setInputState(e.target.value)}
          className="mt-0.5 w-full rounded border-gray-300 shadow-sm sm:text-sm"
        />
        <button
          type="button"
          onClick={handleClick}
          className="w-full rounded py-2 bg-purple-600 text-white text-lg">
          Let's go
        </button>
      </div>
      {progress.totalPages > 0 && (
        <>
          <p>Pages visited:</p>

          <progress
            max={progress.totalPages}
            value={progress.page}
            className="w-full rounded-full h-8"
            // style={{
            //   // Fix overflow clipping in Safari
            //   // https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0
            //   transform: "translateZ(0)"
            // }}
          />

          <p>
            {progress.page}/{progress.totalPages}
          </p>
          <p>Number of unique threads found: {progress.found} </p>
        </>
      )}
      {stories && stories.length > 0 && stories.length >= progress.found && (
        <button
          onClick={() => {
            chrome.tabs.create({
              url: "./tabs/stories.html"
            })
          }}>
          Open tab page
        </button>
      )}
    </div>
  )
}
