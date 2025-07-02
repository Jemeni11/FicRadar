import type { StoryResult } from "@/types"

export default function sortByCountDescending(
  data: StoryResult[],
): StoryResult[] {
  return data.sort((a, b) => b.count - a.count)
}
