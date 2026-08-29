import type { Folder, Memo, Tag } from '@/types'

export interface SearchMatch {
  memo: Memo
  folder: Folder | null
  tags: Tag[]
}

export function matchesQuery(memo: Memo, folder: Folder | null, tags: Tag[], query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  if (memo.title.toLowerCase().includes(q)) return true
  if (memo.body.toLowerCase().includes(q)) return true
  if (folder && folder.name.toLowerCase().includes(q)) return true
  if (tags.some((tag) => tag.name.toLowerCase().includes(q))) return true
  return false
}

export function highlightSegments(text: string, query: string): { text: string; highlighted: boolean }[] {
  const q = query.trim()
  if (!q) return [{ text, highlighted: false }]

  const lowerText = text.toLowerCase()
  const lowerQuery = q.toLowerCase()
  const segments: { text: string; highlighted: boolean }[] = []
  let cursor = 0

  while (cursor < text.length) {
    const matchIndex = lowerText.indexOf(lowerQuery, cursor)
    if (matchIndex === -1) {
      segments.push({ text: text.slice(cursor), highlighted: false })
      break
    }
    if (matchIndex > cursor) {
      segments.push({ text: text.slice(cursor, matchIndex), highlighted: false })
    }
    segments.push({ text: text.slice(matchIndex, matchIndex + q.length), highlighted: true })
    cursor = matchIndex + q.length
  }

  return segments
}
