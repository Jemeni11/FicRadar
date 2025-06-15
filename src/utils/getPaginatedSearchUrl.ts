export default function getPaginatedSearchUrl(
  baseUrl: string,
  pageNumber: number
): string {
  const url = new URL(baseUrl)

  if (pageNumber > 1) {
    url.searchParams.set("page", String(pageNumber))

    // Ensure query `q=*` is set (it’s percent-encoded)
    if (!url.searchParams.has("q")) {
      url.searchParams.set("q", "%252A")
    }
  } else {
    // Remove page param on page 1 to match the original URL format
    url.searchParams.delete("page")
    url.searchParams.delete("q") // original page 1 has no `q`
  }

  return url.toString()
}
