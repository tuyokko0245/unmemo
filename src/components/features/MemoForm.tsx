'use client'

import { useState } from 'react'
import { Folder as FolderIcon } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { TagBadge } from '@/components/ui/TagBadge'
import { FolderSelector } from './FolderSelector'
import { TagSelector } from './TagSelector'
import type { Folder, Tag } from '@/types'

interface MemoFormProps {
  title: string
  body: string
  folderId: string | null
  tagIds: string[]
  folders: Folder[]
  tags: Tag[]
  onTitleChange: (value: string) => void
  onBodyChange: (value: string) => void
  onFolderChange: (folderId: string | null) => void
  onTagIdsChange: (tagIds: string[]) => void
}

export function MemoForm({
  title,
  body,
  folderId,
  tagIds,
  folders,
  tags,
  onTitleChange,
  onBodyChange,
  onFolderChange,
  onTagIdsChange,
}: MemoFormProps) {
  const [isFolderSheetOpen, setIsFolderSheetOpen] = useState(false)
  const [isTagSheetOpen, setIsTagSheetOpen] = useState(false)

  const folder = folderId ? folders.find((f) => f.id === folderId) : undefined
  const selectedTags = tags.filter((t) => tagIds.includes(t.id))

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <Input value={title} onChange={onTitleChange} placeholder="タイトル" />
      <Textarea value={body} onChange={onBodyChange} placeholder="メモを入力..." minRows={8} />

      <button
        type="button"
        onClick={() => setIsFolderSheetOpen(true)}
        className="flex w-fit items-center gap-1.5 rounded-md bg-bg-secondary px-3 py-2 text-xs font-bold text-text-primary"
      >
        <FolderIcon size={13} />
        {folder ? (
          <>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: folder.color }} />
            {folder.name}
          </>
        ) : (
          '未分類'
        )}
      </button>

      <div className="flex flex-wrap items-center gap-2">
        {selectedTags.map((tag) => (
          <TagBadge key={tag.id} name={tag.name} onRemove={() => onTagIdsChange(tagIds.filter((id) => id !== tag.id))} />
        ))}
        <button
          type="button"
          onClick={() => setIsTagSheetOpen(true)}
          className="rounded-sm bg-bg-secondary px-2.5 py-1 text-[11px] font-bold text-text-secondary"
        >
          + タグを追加
        </button>
      </div>

      <FolderSelector
        isOpen={isFolderSheetOpen}
        onClose={() => setIsFolderSheetOpen(false)}
        folders={folders}
        selectedFolderId={folderId}
        onSelect={onFolderChange}
      />
      <TagSelector
        isOpen={isTagSheetOpen}
        onClose={() => setIsTagSheetOpen(false)}
        tags={tags}
        selectedTagIds={tagIds}
        onChange={onTagIdsChange}
      />
    </div>
  )
}
