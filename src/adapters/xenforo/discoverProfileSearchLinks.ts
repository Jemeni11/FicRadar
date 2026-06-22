export type XenForoProfileSearchLinks = {
  /** Search URL for everything the user posted, used as the consumption signal. */
  allContentUrl?: string
  /** Search URL for story threads the user created, preferred for marking own works. */
  authoredStoriesUrl?: string
  /** Search URL for all threads the user created, used only when story-only discovery is unavailable. */
  authoredThreadsUrl?: string
}

function normalizeText(value: string | null | undefined): string {
  return value?.replace(/\s+/g, ' ').trim().toLowerCase() ?? ''
}

function toAbsoluteUrl(baseURL: string, href: string): string | undefined {
  try {
    return new URL(href, baseURL).toString()
  } catch {
    return undefined
  }
}

function isScrapeableSearchLink(href: string): boolean {
  try {
    return new URL(href, 'https://example.test').pathname.startsWith('/search/')
  } catch {
    return false
  }
}

/**
 * Reads the profile action links XenForo exposes for a user.
 *
 * The story-specific authored link is more useful than the generic thread link
 * because forums such as QQ expose separate story and quest node filters.
 */
export default function discoverProfileSearchLinks(
  profileDoc: Document,
  baseURL: string,
): XenForoProfileSearchLinks {
  const links: XenForoProfileSearchLinks = {}
  const anchors = Array.from(profileDoc.querySelectorAll('a[href]'))

  for (const anchor of anchors) {
    const href = anchor.getAttribute('href')
    if (!href) continue

    const text = normalizeText(anchor.textContent)
    if (!text.startsWith('find all ') || text.includes('quest')) continue
    if (!isScrapeableSearchLink(href)) continue

    const absoluteUrl = toAbsoluteUrl(baseURL, href)
    if (!absoluteUrl) continue

    if (!links.allContentUrl && text.includes('content')) {
      links.allContentUrl = absoluteUrl
    }

    if (!links.authoredStoriesUrl && text.includes('stor')) {
      links.authoredStoriesUrl = absoluteUrl
      continue
    }

    if (!links.authoredThreadsUrl && text.includes('thread')) {
      links.authoredThreadsUrl = absoluteUrl
    }
  }

  return links
}
