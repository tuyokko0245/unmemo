'use client'

import { Folder as FolderIcon, Tag as TagIcon } from 'lucide-react'
import { highlightSegments } from '@/lib/search'
import type { Folder, Memo, Tag } from '@/types'

interface SearchResultCardProps {
  memo: Memo
  folder: Folder | null
  tags: Tag[]
  query: string
  onClick: (id: string) => void
}

function Highlighted({ text, query }: { text: string; query: string }) {
  return (
    <>
      {highlightSegments(text, query).map((segment, i) =>
        segment.highlighted ? (
          <mark key={i} className="rounded-sm bg-[#FFF1A8] px-0.5 text-inherit">
            {segment.text}
          </mark>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </>
  )
}

function formatDate(timestampMillis: number) {
  const date = new Date(timestampMillis)
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function SearchResultCard({ memo, folder, tags, query, onClick }: SearchResultCardProps) {
  const updatedAtMillis = memo.updatedAt?.toMillis?.()

  return (
    <button
      type="button"
      onClick={() => onClick(memo.id)}
      className="flex w-full flex-col gap-1.5 rounded-md bg-bg-card p-3 text-left shadow-sm"
    >
      <div className="text-sm font-bold text-text-primary">
        <Highlighted text={memo.title || '無題のメモ'} query={query} />
      </div>
      <div className="line-clamp-2 text-xs leading-relaxed text-text-secondary">
        <Highlighted text={memo.body} query={query} />
      </div>
      <div className="flex items-center gap-2.5 text-[11px] text-text-tertiary">
        <span className="flex items-center gap-0.5">
          <FolderIcon size={11} /> {folder ? folder.name : '未分類'}
        </span>
        {tags.length > 0 && (
          <span className="flex items-center gap-0.5">
            <TagIcon size={11} /> {tags.map((t) => t.name).join(', ')}
          </span>
        )}
        {updatedAtMillis && <span className="ml-auto">{formatDate(updatedAtMillis)}</span>}
      </div>
    </button>
  )
}
