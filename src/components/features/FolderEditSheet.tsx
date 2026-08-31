'use client'

import { useState } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Input } from '@/components/ui/Input'
import { ColorDot } from '@/components/ui/ColorDot'
import { Button } from '@/components/ui/Button'
import { PASTEL_COLORS } from '@/lib/constants'
import type { Folder } from '@/types'

interface FolderEditSheetProps {
  isOpen: boolean
  onClose: () => void
  folder: Folder | null
  allFolders?: Folder[]
  onSave: (data: { name: string; color: string; isImportant: boolean; parentId: string | null }) => Promise<void>
  onDelete?: () => Promise<void>
}

function getDescendantIds(folderId: string, allFolders: Folder[]): Set<string> {
  const result = new Set<string>()
  const queue = [folderId]
  while (queue.length > 0) {
    const id = queue.shift()!
    allFolders.filter((f) => f.parentId === id).forEach((c) => {
      result.add(c.id)
      queue.push(c.id)
    })
  }
  return result
}

function buildSelectableFolders(
  allFolders: Folder[],
  currentFolderId: string | undefined,
): { folder: Folder; depth: number }[] {
  const excluded = new Set<string>()
  if (currentFolderId) {
    excluded.add(currentFolderId)
    getDescendantIds(currentFolderId, allFolders).forEach((id) => excluded.add(id))
  }

  const result: { folder: Folder; depth: number }[] = []
  function traverse(parentId: string | null, depth: number) {
    allFolders
      .filter((f) => f.parentId === parentId)
      .sort((a, b) => a.order - b.order)
      .forEach((folder) => {
        if (!excluded.has(folder.id)) {
          result.push({ folder, depth })
          traverse(folder.id, depth + 1)
        }
      })
  }
  traverse(null, 0)
  return result
}

function FolderEditForm({
  folder,
  allFolders,
  onClose,
  onSave,
  onDelete,
}: {
  folder: Folder | null
  allFolders: Folder[]
  onClose: () => void
  onSave: (data: { name: string; color: string; isImportant: boolean; parentId: string | null }) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const [name, setName] = useState(folder?.name ?? '')
  const [color, setColor] = useState<string>(folder?.color ?? PASTEL_COLORS[0].hex)
  const [isImportant, setIsImportant] = useState(folder?.isImportant ?? false)
  const [parentId, setParentId] = useState<string | null>(folder?.parentId ?? null)
  const [saving, setSaving] = useState(false)

  const selectableFolders = buildSelectableFolders(allFolders, folder?.id)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave({ name: name.trim(), color, isImportant, parentId })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 pt-2">
      <Input label="フォルダ名" value={name} onChange={setName} maxLength={50} autoFocus />

      <div>
        <span className="text-[13px] font-medium text-text-secondary">カラー</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {PASTEL_COLORS.map((c) => (
            <ColorDot
              key={c.hex}
              color={c.hex}
              colorName={c.name}
              isSelected={color === c.hex}
              onClick={() => setColor(c.hex)}
            />
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold text-text-primary">
        <input type="checkbox" checked={isImportant} onChange={(e) => setIsImportant(e.target.checked)} />
        ★ 重要フォルダに設定
      </label>

      <div>
        <span className="text-[13px] font-medium text-text-secondary">親フォルダ</span>
        <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setParentId(null)}
            className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold transition-colors ${parentId === null ? 'bg-base-100 text-base-700' : 'text-text-primary'}`}
          >
            <span className="text-text-tertiary text-xs">―</span>
            トップレベル（親フォルダなし）
          </button>
          {selectableFolders.map(({ folder: f, depth }) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setParentId(f.id)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold transition-colors ${parentId === f.id ? 'bg-base-100 text-base-700' : 'text-text-primary'}`}
              style={{ paddingLeft: 12 + depth * 16 }}
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: f.color }} />
              {f.name}
            </button>
          ))}
        </div>
      </div>

      <Button fullWidth onClick={handleSave} loading={saving} disabled={!name.trim()}>
        保存
      </Button>

      {onDelete && (
        <Button fullWidth variant="danger" onClick={onDelete}>
          フォルダを削除
        </Button>
      )}
    </div>
  )
}

export function FolderEditSheet({ isOpen, onClose, folder, allFolders = [], onSave, onDelete }: FolderEditSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={folder ? 'フォルダを編集' : 'フォルダを追加'}>
      {isOpen && (
        <FolderEditForm
          key={folder?.id ?? 'new'}
          folder={folder}
          allFolders={allFolders}
          onClose={onClose}
          onSave={onSave}
          onDelete={onDelete}
        />
      )}
    </BottomSheet>
  )
}
