import { customError } from '@/utils/helpers'
import { parseHTMLDocument } from '@/utils/url'

/**
 * Fetches a remote HTML page and converts it into a DOM document
 * suitable for scraping.
 *
 * This also:
 * - normalizes relative URLs using a <base> tag
 * - translates XenForo access errors (403/401) into consistent app errors
 * - extracts and surfaces forum-specific block messages when available
 */
async function getDocument(url: string, baseURL: string, adapterName: string) {
  const response = await fetch(url, {
    mode: 'cors',
    credentials: 'include',
  })
  const html = await response.text()
  const document = parseHTMLDocument(html)

  if (response.status === 403 || response.status === 401) {
    const blockMessage = document
      .querySelector('.blockMessage')
      ?.textContent?.trim()

    if (blockMessage === "This user's profile is not available.") {
      customError(adapterName, blockMessage)
    } else {
      customError(adapterName, "User isn't logged in")
    }
  }

  const baseTag = document.createElement('base')
  baseTag.href = baseURL
  document.head.prepend(baseTag)

  return document
}

export default getDocument
