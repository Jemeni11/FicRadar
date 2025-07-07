import type { AuthorStatus, StoryResult } from "@/types"

export default function saveHTMLFile(data: AuthorStatus, fileName: string) {
  if (data.stories.length === 0) {
    console.error("No data to save.")
    return
  }

  const headers = Object.keys(data[0].stories[0]) as Array<keyof StoryResult>

  const rows = data.stories.map((row) => {
    const cells = headers.map((header) => {
      const value = row[header]
      if (header === "link") {
        return `<td style="white-space: nowrap; padding: 0.5rem 1rem; color: #374151;">
          <a href="${value}" target="_blank">${value}</a>
          </td>`
      }
      return `<td style="white-space: nowrap; padding: 0.5rem 1rem; color: #374151;">${value}</td>`
    })
    return `<tr style="border-bottom: 1px solid #E5E7EB;">${cells.join("")}</tr>`
  })

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Data Table</title>
    </head>
    <body style="font-family: Arial, sans-serif; margin: 0; padding: 1rem; background-color: #F9FAFB;">
      <div style="overflow-x: auto;">
        <table style="min-width: 100%; border-collapse: collapse; background-color: #FFFFFF; font-size: 0.875rem;">
          <thead>
            <tr>
              ${headers
                .map(
                  (header) =>
                    `<th style="white-space: nowrap; padding: 0.5rem 1rem; font-weight: 500; color: #1F2937; text-align: left;">${String(header)}</th>`,
                )
                .join("")}
            </tr>
          </thead>
          <tbody>
            ${rows.join("\n")}
          </tbody>
        </table>
      </div>
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
