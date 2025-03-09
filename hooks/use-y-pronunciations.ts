import { useState, useCallback } from "react"
import type { NameField, YPosition } from "@/app/numerology/types"

export function useYPronunciations() {
  const [yPronunciations, setYPronunciations] = useState<YPosition[]>([])

  const setYPronunciation = useCallback((nameField: NameField, position: number, isVowel: boolean) => {
    setYPronunciations((prev) => {
      const existing = prev.findIndex((p) => p.nameField === nameField && p.position === position)
      if (existing >= 0) {
        const newPronunciations = [...prev]
        newPronunciations[existing] = { nameField, position, isVowel }
        return newPronunciations
      }
      return [...prev, { nameField, position, isVowel }]
    })
  }, [])

  const getYPronunciation = useCallback(
    (nameField: NameField, position: number) => {
      return yPronunciations.find((p) => p.nameField === nameField && p.position === position)
    },
    [yPronunciations],
  )

  return {
    yPronunciations,
    setYPronunciation,
    getYPronunciation,
  }
}

