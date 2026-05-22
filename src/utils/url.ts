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

// Remove everything after the last slash if it starts with "post-"
export function removePostNumber(url: string): string {
  const urlObj = new URL(url)
  const pathParts = urlObj.pathname.split('/')
  if (pathParts[pathParts.length - 1].startsWith('post-')) {
    pathParts.pop()
    urlObj.pathname = pathParts.join('/')
  }
  return urlObj.toString()
}
