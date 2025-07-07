import type { AuthorStatus } from "@/types"

export default function saveBookmarkHTMLFile(
  data: AuthorStatus,
  fileName: string,
) {
  if (data.stories.length === 0) {
    console.error("No data to save.")
    return
  }

  const content = data.stories
    .map((story) => {
      return `<dt><a href="${story.link}" target="_blank">${story.title}</a></dt>`
    })
    .join("\n")

  const htmlContent = `
    <!DOCTYPE NETSCAPE-Bookmark-file-1>
    <!-- This is an automatically generated file.
        It will be read and overwritten.
        DO NOT EDIT! -->
    <html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
        <title>Bookmarks</title>
    </head>
    <body>
        <h1>Bookmarks</h1>
        <dl>
            ${content}
        </dl>
    </body>
    </html>
  `

  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()

  URL.revokeObjectURL(url)
}
