'use client'

import { Button } from '@/components/ui/Button'
import type { Memo } from '@/types'

const RETENTION_DAYS = 30

interface TrashCardProps {
  memo: Memo
  onRestore: () => void
  onDeleteForever: () => void
}

function formatDate(timestampMillis: number) {
  const date = new Date(timestampMillis)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function remainingDays(deletedAtMillis: number) {
  const elapsedDays = Math.floor((Date.now() - deletedAtMillis) / (1000 * 60 * 60 * 24))
  return Math.max(RETENTION_DAYS - elapsedDays, 0)
}

export function TrashCard({ memo, onRestore, onDeleteForever }: TrashCardProps) {
  const deletedAtMillis = memo.deletedAt?.toMillis?.()
  const remaining = deletedAtMillis ? remainingDays(deletedAtMillis) : null

  return (
    <div className="rounded-md bg-bg-secondary p-3 shadow-sm">
      <div className="mb-1 line-clamp-1 text-sm font-bold text-text-tertiary">{memo.title || '無題のメモ'}</div>
      <div className="mb-2 line-clamp-2 text-xs leading-relaxed text-text-tertiary">{memo.body}</div>
      {deletedAtMillis && remaining !== null && (
        <div className="mb-2.5 flex items-center gap-2.5 text-xs">
          <span className="text-text-tertiary">削除日: {formatDate(deletedAtMillis)}</span>
          <span className={`font-bold ${remaining <= 7 ? 'text-error' : 'text-text-secondary'}`}>残 {remaining}日</span>
        </div>
      )}
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" fullWidth onClick={onRestore}>
          復元
        </Button>
        <Button variant="danger" size="sm" fullWidth onClick={onDeleteForever}>
          完全削除
        </Button>
      </div>
    </div>
  )
}
