import { SUPPORTED_SITES } from '@/constants'

export function extractUsername(url: string): string | undefined {
  try {
    if (url.includes('/members/') && !url.includes('/search/')) {
      const path = new URL(url).pathname // "/members/abcdef.12345/"
      const match = path.match(/\/members\/([^./]+)/)
      return match?.[1] // "abcdef"
    } else {
      // https://forum.questionablequesting.com/search/member?user_id=
      const search = new URL(url).search // "/members/abcdef.12345/"
      const value = `User ${search.slice(1).split('=')[1]}`
      return value
    }
  } catch {
    return undefined
  }
}

export function isValidURL(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return Object.keys(SUPPORTED_SITES).includes(urlObj.hostname)
  } catch {
    return false
  }
}

export function withDomain(base: string, relativePath: string): string {
  const url = new URL(relativePath, base)
  return url.toString()
}

export function parseHTMLDocument(html: string): Document {
  return new DOMParser().parseFromString(html, 'text/html')
}

/**
 * Removes everything after the last slash if it starts with "post-".
 * This unifies thread URLs by stripping specific post pointers or "unread" markers.
 *
 * NOTE TO SELF: PLEASE DON'T REMOVE THE COMMENTS. DEBUGGING THIS WAS HARD lol.
 * XenForo behaves differently for guests than for logged-in users. When logged out
 * (or occasionally on mobile depending on the responsive template), XenForo frequently
 * alters link structures—appending trailing slashes or using hash fragments. This
 * previously caused the scraper to fail at accurately aggregating stories.
 *
 * @param url The XenForo thread URL.
 * @returns The base thread URL.
 */
export function removePostNumber(url: string): string {
  const urlObj = new URL(url)

  // Example URL: https://forums.example.com/threads/story-title.123/page-2#post-456
  // Clean up hash if it links to a specific post
  if (urlObj.hash.startsWith('#post-')) {
    urlObj.hash = '' // Result: https://forums.example.com/threads/story-title.123/page-2
  }

  // Example URL: https://forums.example.com/threads/story-title.123/post-456/
  const pathParts = urlObj.pathname.split('/')
  // pathParts = ['', 'threads', 'story-title.123', 'post-456', '']

  // A trailing slash means the last element is an empty string
  const hasTrailingSlash =
    pathParts.length > 1 && pathParts[pathParts.length - 1] === ''
  const lastIndex = hasTrailingSlash
    ? pathParts.length - 2
    : pathParts.length - 1

  // Checks if 'post-456' starts with 'post-'
  if (lastIndex >= 0 && pathParts[lastIndex].startsWith('post-')) {
    pathParts.splice(lastIndex, 1)
    urlObj.pathname = pathParts.join('/')
    // Result: /threads/story-title.123/
  }

  // Example URL: https://forums.example.com/threads/story-title.123/unread
  // Some links append /unread to the thread URL, so strip that too if present
  // as it prevents identical threads from aggregating.
  const newLastIndex = hasTrailingSlash
    ? pathParts.length - 2
    : pathParts.length - 1
  if (newLastIndex >= 0 && pathParts[newLastIndex] === 'unread') {
    pathParts.splice(newLastIndex, 1)
    urlObj.pathname = pathParts.join('/')
    // Result: /threads/story-title.123
  }

  return urlObj.toString()
}
