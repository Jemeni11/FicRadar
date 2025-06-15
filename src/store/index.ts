import type { fileFormatType } from "@/types"
import { atom } from "jotai"

export const fileFormatAtom = atom<fileFormatType>("json")
