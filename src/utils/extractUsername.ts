export default function extractUsername(url: string): string | undefined {
  try {
    const path = new URL(url).pathname // "/members/abcdef.12345/"
    const match = path.match(/\/members\/([^./]+)/)
    return match?.[1] // "abcdef"
  } catch {
    return undefined
  }
}
