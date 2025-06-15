import type { storyObject } from "@/types"
import { copyToClipboard } from "@/utils"

import { Storage } from "@plasmohq/storage"
import { useStorage } from "@plasmohq/storage/hook"

import "@/style.css"

export default function Stories() {
  const localStorage = new Storage({ area: "local" })

  const [storage] = useStorage<{
    author: string
    stories: storyObject[]
  }>(
    {
      key: "ficradarData",
      instance: localStorage
    },
    {
      author: "",
      stories: []
    }
  )
  const { author, stories } = storage

  return (
    <section className="w-full">
      <h1 className="py-8 px-[5vw] font-bold text-3xl">{author}</h1>
      <main>
        <div className="py-8 px-[5vw] max-w-[90vw] overflow-x-auto">
          <table className="min-w-full divide-y-2 divide-gray-200">
            <thead className="sticky top-0 bg-white ltr:text-left rtl:text-right">
              <tr className="*:font-medium *:text-gray-900">
                <th className="px-3 py-2 whitespace-nowrap">S/N</th>
                <th className="px-3 py-2 whitespace-nowrap">Title & Link</th>
                <th className="px-3 py-2 whitespace-nowrap">Count</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {stories.map((story, index) => (
                <tr className="*:text-gray-900">
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    <p className="inline-flex items-center gap-x-2">
                      <a
                        href={story.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2">
                        {story.title}
                      </a>
                      <span
                        role="button"
                        onClick={() => copyToClipboard(story.link)}>
                        Copy link
                      </span>
                    </p>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-center">
                    {story.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </section>
  )
}
