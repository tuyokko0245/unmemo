'use client'

import { useCallback, useState } from 'react'

const STORAGE_KEY = 'unmemo:recentSearches'
const MAX_ITEMS = 8

function readStoredSearches(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>(readStoredSearches)

  const addRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((t) => t !== trimmed)].slice(0, MAX_ITEMS)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
    window.localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { recentSearches, addRecentSearch, clearRecentSearches }
}
