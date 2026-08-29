'use client'

import { ChevronDown, ChevronRight, Folder as FolderIcon, GripVertical, MoreVertical } from 'lucide-react'
import type { Folder } from '@/types'

interface FolderItemProps {
  folder: Folder
  depth: number
  isActive: boolean
  isExpanded: boolean
  hasChildren: boolean
  onSelect: () => void
  onToggleExpand: () => void
  onMenuOpen: (folderId: string) => void
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
}

export function FolderItem({
  folder,
  depth,
  isActive,
  isExpanded,
  hasChildren,
  onSelect,
  onToggleExpand,
  onMenuOpen,
  dragHandleProps,
}: FolderItemProps) {
  return (
    <div
      role="treeitem"
      aria-selected={isActive}
      aria-expanded={hasChildren ? isExpanded : undefined}
      className={`flex min-h-touch cursor-pointer items-center gap-1 pr-4 ${isActive ? 'bg-base-100' : ''}`}
      style={{ paddingLeft: 8 + depth * 20 }}
      onClick={onSelect}
    >
      {dragHandleProps && (
        <button
          type="button"
          aria-label="ドラッグして並び替え"
          onClick={(e) => e.stopPropagation()}
          className="flex h-8 w-5 shrink-0 cursor-grab touch-none items-center justify-center text-text-tertiary active:cursor-grabbing"
          {...dragHandleProps}
        >
          <GripVertical size={13} />
        </button>
      )}
      {hasChildren ? (
        <button
          type="button"
          aria-label={isExpanded ? '折りたたむ' : '展開する'}
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand()
          }}
          className="shrink-0 text-text-tertiary"
        >
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
      ) : (
        <span className="w-[10px] shrink-0" />
      )}
      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: folder.color }} />
      <FolderIcon size={14} className="shrink-0 text-text-secondary" />
      <span className={`flex-1 truncate text-sm font-semibold ${isActive ? 'text-base-700' : 'text-text-primary'}`}>{folder.name}</span>
      {folder.isImportant && <span className="shrink-0 text-xs text-important-star">★</span>}
      <button
        type="button"
        aria-label="フォルダ操作メニュー"
        onClick={(e) => {
          e.stopPropagation()
          onMenuOpen(folder.id)
        }}
        className="shrink-0 text-text-tertiary"
      >
        <MoreVertical size={15} />
      </button>
    </div>
  )
}
