import { SUPPORTED_SITES } from "@/constants"

const isValidURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return Object.keys(SUPPORTED_SITES).includes(urlObj.hostname)
  } catch {
    return false
  }
}

export default isValidURL
