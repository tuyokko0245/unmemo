'use client'

import { useRef, useState } from 'react'
import { Folder as FolderIcon, Tag as TagIcon } from 'lucide-react'
import { FolderSelector } from './FolderSelector'
import { TagSelector } from './TagSelector'
import { Button } from '@/components/ui/Button'
import { useFolders } from '@/hooks/useFolders'
import { useTags } from '@/hooks/useTags'
import { useAuth } from '@/hooks/useAuth'
import { useSnackbar } from '@/hooks/useSnackbar'
import { createMemo } from '@/lib/firebase/memos'

export function QuickInputArea({ defaultFolderId = null }: { defaultFolderId?: string | null }) {
  const { user } = useAuth()
  const { folders } = useFolders()
  const { tags } = useTags()
  const { showSnackbar } = useSnackbar()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [folderId, setFolderId] = useState<string | null>(defaultFolderId)
  const [tagIds, setTagIds] = useState<string[]>([])
  const [isFolderSheetOpen, setIsFolderSheetOpen] = useState(false)
  const [isTagSheetOpen, setIsTagSheetOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)

  const selectedFolder = folders.find((f) => f.id === folderId)

  const handleSave = async () => {
    if (!user || (!title.trim() && !body.trim())) return
    setIsSaving(true)
    try {
      await createMemo(user.uid, { title: title.trim(), body: body.trim(), folderId, tagIds })
      setTitle('')
      setBody('')
      setFolderId(null)
      setTagIds([])
      titleRef.current?.focus()
      showSnackbar({ message: 'メモを保存しました' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="sticky top-0 z-10 px-4 pb-2 pt-3">
      <div
        className="rounded-xl bg-base-100 p-4 shadow-md"
        style={selectedFolder ? ({ '--base-100': selectedFolder.color } as React.CSSProperties) : undefined}
      >
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトルを入力...（任意）"
          autoFocus
          className="w-full bg-transparent text-sm font-bold text-base-700 outline-none placeholder:text-text-tertiary"
        />
        <div className="my-1.5 h-px bg-base-200/60" />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="メモを入力..."
          rows={3}
          className="w-full resize-none bg-transparent text-[13px] leading-relaxed text-base-700 outline-none placeholder:text-text-tertiary"
        />
        <div className="my-1.5 h-px bg-base-200/60" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsFolderSheetOpen(true)}
            className="flex items-center gap-1 rounded-md bg-bg-primary px-2.5 py-2 text-xs font-bold text-base-700"
          >
            <FolderIcon size={13} />
            {selectedFolder ? (
              <>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: selectedFolder.color }} />
                {selectedFolder.name}
              </>
            ) : (
              'フォルダ選択'
            )}
          </button>
          <button
            type="button"
            onClick={() => setIsTagSheetOpen(true)}
            className="flex items-center gap-1 rounded-md bg-bg-primary px-2.5 py-2 text-xs font-bold text-base-700"
          >
            <TagIcon size={13} /> タグ{tagIds.length > 0 ? `(${tagIds.length})` : ''}
          </button>
          <div className="flex-1" />
          <Button size="sm" onClick={handleSave} loading={isSaving} disabled={!title.trim() && !body.trim()}>
            保存
          </Button>
        </div>
      </div>

      <FolderSelector
        isOpen={isFolderSheetOpen}
        onClose={() => setIsFolderSheetOpen(false)}
        folders={folders}
        selectedFolderId={folderId}
        onSelect={setFolderId}
      />
      <TagSelector
        isOpen={isTagSheetOpen}
        onClose={() => setIsTagSheetOpen(false)}
        tags={tags}
        selectedTagIds={tagIds}
        onChange={setTagIds}
      />
    </div>
  )
}
