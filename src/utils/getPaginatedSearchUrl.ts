export default function getPaginatedSearchUrl(
  baseUrl: string,
  pageNumber: number
): string {
  let original = new URL(baseUrl)

  if (pageNumber === 1) {
    original.searchParams.delete("page")
    original.searchParams.delete("q")
    return original.toString()
  }

  const fresh = new URL(original.origin + original.pathname)

  fresh.searchParams.set("page", String(pageNumber))
  fresh.searchParams.set("q", "%252A")

  // Copy over other params from original
  original.searchParams.forEach((value, key) => {
    if (!["page", "q"].includes(key)) {
      fresh.searchParams.set(key, value)
    }
  })

  return fresh.toString()
}
