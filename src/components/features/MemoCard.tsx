'use client'

import { GripVertical } from 'lucide-react'
import { assignRandomPastel } from '@/lib/constants'
import type { Memo, Tag } from '@/types'

interface MemoCardProps {
  memo: Memo
  folderColor: string | null
  tags: Tag[]
  onClick: (id: string) => void
  isDragMode?: boolean
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
  isDragging?: boolean
}

function formatDate(timestampMillis: number) {
  const date = new Date(timestampMillis)
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function MemoCard({ memo, folderColor, tags, onClick, isDragMode, dragHandleProps, isDragging }: MemoCardProps) {
  const color = folderColor ?? assignRandomPastel(memo.id)
  const updatedAtMillis = memo.updatedAt?.toMillis?.()

  return (
    <button
      type="button"
      onClick={() => !isDragMode && onClick(memo.id)}
      className={`relative flex min-h-[150px] flex-col gap-1.5 rounded-md p-3 text-left shadow-sm transition-transform ${
        isDragMode ? 'touch-none' : 'hover:-translate-y-0.5 hover:shadow-md'
      } ${isDragging ? 'shadow-lg' : ''}`}
      style={{ backgroundColor: color, opacity: isDragging ? 0.6 : 1 }}
      {...(isDragMode ? dragHandleProps : {})}
    >
      {isDragMode && (
        <GripVertical size={16} className="absolute right-2 top-2 text-[rgba(60,60,60,0.5)]" />
      )}
      <div className="line-clamp-2 text-sm font-bold leading-snug text-[#2E2E2E]">
        {memo.title || '無題のメモ'}
      </div>
      <div className="line-clamp-3 flex-1 text-xs leading-relaxed text-[#4A4A4A]">{memo.body}</div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span key={tag.id} className="rounded-sm bg-white/55 px-2 py-0.5 text-[11px] font-bold text-[#3A3A3A]">
              #{tag.name}
            </span>
          ))}
        </div>
      )}
      {updatedAtMillis && (
        <div className="mt-0.5 text-[11px] text-[rgba(60,60,60,0.65)]">{formatDate(updatedAtMillis)}</div>
      )}
    </button>
  )
}
