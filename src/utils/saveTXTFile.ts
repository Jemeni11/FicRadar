import type { AuthorStatus } from "@/types"

export default function saveTXTFile(data: AuthorStatus[], fileName: string) {
  if (data.length === 0) {
    console.error("No data to save.")
    return
  }

  let content = data.map((item) => item.url).join("\n")
  const blob = new Blob([content], { type: "text/plain;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()

  URL.revokeObjectURL(url)
}
