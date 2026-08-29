'use client'

import { useState } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import type { Folder, Tag } from '@/types'

interface FilterBarProps {
  folders: Folder[]
  tags: Tag[]
  folderId: string | null
  tagIds: string[]
  onFolderChange: (folderId: string | null) => void
  onTagIdsChange: (tagIds: string[]) => void
}

export function FilterBar({ folders, tags, folderId, tagIds, onFolderChange, onTagIdsChange }: FilterBarProps) {
  const [isFolderSheetOpen, setIsFolderSheetOpen] = useState(false)
  const [isTagSheetOpen, setIsTagSheetOpen] = useState(false)

  const folderLabel = folderId === null ? 'すべて' : (folders.find((f) => f.id === folderId)?.name ?? 'すべて')
  const tagLabel = tagIds.length === 0 ? 'すべて' : `${tagIds.length}件選択中`

  const toggleTag = (tagId: string) => {
    onTagIdsChange(tagIds.includes(tagId) ? tagIds.filter((id) => id !== tagId) : [...tagIds, tagId])
  }

  return (
    <>
      <div className="flex gap-2 overflow-x-auto px-4 pb-3">
        <button
          type="button"
          onClick={() => setIsFolderSheetOpen(true)}
          className="shrink-0 whitespace-nowrap rounded-full bg-base-100 px-3 py-1.5 text-xs font-bold text-base-700"
        >
          📁 フォルダ: {folderLabel}
        </button>
        <button
          type="button"
          onClick={() => setIsTagSheetOpen(true)}
          className="shrink-0 whitespace-nowrap rounded-full bg-base-100 px-3 py-1.5 text-xs font-bold text-base-700"
        >
          🏷 タグ: {tagLabel}
        </button>
      </div>

      <BottomSheet isOpen={isFolderSheetOpen} onClose={() => setIsFolderSheetOpen(false)} title="フォルダで絞り込み">
        <div className="flex flex-col">
          <button
            type="button"
            className={`min-h-touch text-left text-sm font-semibold ${folderId === null ? 'text-base-600' : 'text-text-primary'}`}
            onClick={() => {
              onFolderChange(null)
              setIsFolderSheetOpen(false)
            }}
          >
            すべて
          </button>
          {folders.map((folder) => (
            <button
              key={folder.id}
              type="button"
              className={`flex min-h-touch items-center gap-2 text-left text-sm font-semibold ${folderId === folder.id ? 'text-base-600' : 'text-text-primary'}`}
              onClick={() => {
                onFolderChange(folder.id)
                setIsFolderSheetOpen(false)
              }}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: folder.color }} />
              {folder.name}
            </button>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet isOpen={isTagSheetOpen} onClose={() => setIsTagSheetOpen(false)} title="タグで絞り込み">
        <div className="flex flex-wrap gap-2 pt-2">
          {tags.map((tag) => {
            const selected = tagIds.includes(tag.id)
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`rounded-sm px-3 py-1.5 text-xs font-bold ${
                  selected ? 'bg-base-500 text-white' : 'bg-bg-secondary text-text-primary'
                }`}
              >
                #{tag.name}
              </button>
            )
          })}
        </div>
      </BottomSheet>
    </>
  )
}
