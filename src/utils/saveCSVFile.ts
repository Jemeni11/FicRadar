import type { AuthorStatus, StoryResult } from "@/types"

export default function saveCSVFile(data: AuthorStatus, fileName: string) {
  if (data.stories.length === 0) {
    console.error("No data to save.")
    return
  }

  const headers = Object.keys(data.stories[0])

  const rows = data.stories.map(
    (row) => `${row.title},${row.link},${row.count}`,
  )

  const content = `${headers.join(",")}\n${rows.join("\n")}`

  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()

  URL.revokeObjectURL(url)
}
