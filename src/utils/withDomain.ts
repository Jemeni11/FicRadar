export default function withDomain(base: string, relativePath: string): string {
  const url = new URL(relativePath, base)
  return url.toString()
}
