'use client'

import { ArrowUpDown } from 'lucide-react'
import type { SortKey, SortOrder } from '@/lib/firebase/memos'

interface SortControlProps {
  sortKey: SortKey
  sortOrder: SortOrder
  totalCount: number
  isDragMode: boolean
  onSortChange: (key: SortKey, order: SortOrder) => void
  onToggleDragMode: () => void
}

const SORT_LABELS: Record<Exclude<SortKey, 'order'>, string> = {
  updatedAt: '更新日時',
  createdAt: '作成日時',
  title: 'タイトル',
}

export function SortControl({ sortKey, totalCount, isDragMode, onSortChange, onToggleDragMode }: SortControlProps) {
  const cycleSortKey = () => {
    const keys: Exclude<SortKey, 'order'>[] = ['updatedAt', 'createdAt', 'title']
    const currentIndex = keys.indexOf(sortKey as Exclude<SortKey, 'order'>)
    const next = keys[(currentIndex === -1 ? 0 : currentIndex + 1) % keys.length]
    onSortChange(next, next === 'title' ? 'asc' : 'desc')
  }

  if (isDragMode) {
    return (
      <div className="mx-4 mb-3 flex items-center justify-between rounded-sm bg-bg-secondary px-3 py-2">
        <span className="text-xs font-bold text-text-secondary">並び替えモード</span>
        <button type="button" onClick={onToggleDragMode} className="text-xs font-bold text-base-600">
          完了
        </button>
      </div>
    )
  }

  return (
    <div className="mx-4 mb-3 flex items-center justify-between rounded-sm bg-bg-secondary px-3 py-2">
      <span className="text-xs font-bold text-text-secondary">全{totalCount}件</span>
      <div className="flex items-center gap-3.5">
        <button
          type="button"
          onClick={cycleSortKey}
          className="flex items-center gap-0.5 text-xs font-bold text-text-secondary"
        >
          {sortKey === 'order' ? '手動' : SORT_LABELS[sortKey]} ▼
        </button>
        <button type="button" onClick={onToggleDragMode} aria-label="並び替えモードに切替" className="flex items-center gap-0.5 text-xs font-bold text-text-secondary">
          並び替え
          <ArrowUpDown size={13} />
        </button>
      </div>
    </div>
  )
}
