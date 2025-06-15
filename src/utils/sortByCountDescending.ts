import type { storyObject } from "@/types"

export default function sortByCountDescending(
  data: storyObject[]
): storyObject[] {
  return data.sort((a, b) => b.count - a.count)
}
