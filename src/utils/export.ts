import { sortByCountDescending } from './helpers'

import type { AuthorStatus, StoryResult } from '@/types'

function triggerDownload(content: BlobPart, type: string, fileName: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

export function saveTXTFile(data: AuthorStatus, fileName: string) {
  if (data.stories.length === 0) {
    console.error('No data to save.')
    return
  }
  const content = data.stories.map((story) => story.link).join('\n')
  triggerDownload(content, 'text/plain;charset=utf-8;', fileName)
}

export function saveJSONFile(data: AuthorStatus, fileName: string) {
  if (data.stories.length === 0) {
    console.error('No data to save.')
    return
  }
  const content = JSON.stringify(data.stories, null, 2)
  triggerDownload(content, 'text/plain;charset=utf-8;', fileName)
}

export function saveCSVFile(data: AuthorStatus, fileName: string) {
  if (data.stories.length === 0) {
    console.error('No data to save.')
    return
  }
  const headers = Object.keys(data.stories[0])
  const csvEscape = (value: string) => {
    const escaped = value.replace(/"/g, '""')
    return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped
  }
  const rows = data.stories.map(
    (row) =>
      `${csvEscape(row.title)},${csvEscape(row.link)},${csvEscape(String(row.count))}`,
  )
  const content = `\uFEFF${headers.join(',')}\n${rows.join('\n')}`
  triggerDownload(content, 'text/csv;charset=utf-8;', fileName)
}

export function saveHTMLFile(data: AuthorStatus, fileName: string) {
  if (data.stories.length === 0) {
    console.error('No data to save.')
    return
  }
  const headers = Object.keys(data.stories[0])
  const rows = data.stories.map((row) => {
    const cells = headers.map((header) => {
      const value = row[header as keyof StoryResult]
      if (header === 'link') {
        return `<td style="white-space: nowrap; padding: 0.5rem 1rem; color: #374151;">
          <a href="${value}" target="_blank">${value}</a>
          </td>`
      }
      return `<td style="white-space: nowrap; padding: 0.5rem 1rem; color: #374151;">${value}</td>`
    })
    return `<tr style="border-bottom: 1px solid #E5E7EB;">${cells.join('')}</tr>`
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
                .join('')}
            </tr>
          </thead>
          <tbody>
            ${rows.join('\n')}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `
  triggerDownload(htmlContent, 'text/html;charset=utf-8;', fileName)
}

export function saveBookmarkHTMLFile(data: AuthorStatus, fileName: string) {
  if (data.stories.length === 0) {
    console.error('No data to save.')
    return
  }
  const content = data.stories
    .map((story) => {
      return `<dt><a href="${story.link}" target="_blank">${story.title}</a></dt>`
    })
    .join('\n')

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
  triggerDownload(htmlContent, 'text/html;charset=utf-8;', fileName)
}

export function handleGlobalExport(authors: AuthorStatus[], format: string) {
  const allStories = authors
    .filter((a) => a.status === 'success')
    .flatMap((a) => a.stories)

  const storyMap = new Map<string, StoryResult>()
  for (const story of allStories) {
    const existing = storyMap.get(story.link)
    if (existing) {
      existing.count += story.count
    } else {
      storyMap.set(story.link, { ...story })
    }
  }

  const dedupedStories = sortByCountDescending(Array.from(storyMap.values()))

  const combinedExport: AuthorStatus = {
    name: 'All Authors',
    url: 'N/A',
    stories: dedupedStories,
    status: 'success',
  }

  const filename = `ficradar_all_stories.${format}`

  switch (format) {
    case 'txt':
      saveTXTFile(combinedExport, filename)
      break
    case 'json':
      saveJSONFile(combinedExport, filename)
      break
    case 'csv':
      saveCSVFile(combinedExport, filename)
      break
    case 'html':
      saveHTMLFile(combinedExport, filename)
      break
    case 'bookmark':
      saveBookmarkHTMLFile(combinedExport, filename)
      break
  }
}
