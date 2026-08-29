'use client'

import { X } from 'lucide-react'

interface TagBadgeProps {
  name: string
  onRemove?: () => void
}

export function TagBadge({ name, onRemove }: TagBadgeProps) {
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-white/55 px-2 py-0.5 text-[11px] font-bold text-text-primary">
      #{name}
      {onRemove && (
        <button type="button" onClick={onRemove} aria-label={`${name}を削除`} className="ml-0.5">
          <X size={11} />
        </button>
      )}
    </span>
  )
}
