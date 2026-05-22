import type { StoryResult } from '@/types'

export function customError(
  name: string,
  message: string,
  error?: Error,
  cause?: unknown,
): never {
  const newError = new Error(message, {
    cause: cause ?? error?.cause ?? message,
  })

  newError.name = name

  throw newError
}

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export function sortByCountDescending(data: StoryResult[]): StoryResult[] {
  return data.sort((a, b) => b.count - a.count)
}
