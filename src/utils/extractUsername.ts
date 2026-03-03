export default function extractUsername(url: string): string | undefined {
  try {
    if (url.includes("/members/") && !url.includes("/search/")) {
      const path = new URL(url).pathname // "/members/abcdef.12345/"
      const match = path.match(/\/members\/([^./]+)/)
      return match?.[1] // "abcdef"
    } else {
      // https://forum.questionablequesting.com/search/member?user_id=
      const search = new URL(url).search // "/members/abcdef.12345/"
      const value = `User ${search.slice(1).split("=")[1]}`
      return value
    }
  } catch {
    return undefined
  }
}
