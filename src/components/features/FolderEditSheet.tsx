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
  onSave: (data: { name: string; color: string; isImportant: boolean }) => Promise<void>
  onDelete?: () => Promise<void>
}

function FolderEditForm({
  folder,
  onClose,
  onSave,
  onDelete,
}: {
  folder: Folder | null
  onClose: () => void
  onSave: (data: { name: string; color: string; isImportant: boolean }) => Promise<void>
  onDelete?: () => Promise<void>
}) {
  const [name, setName] = useState(folder?.name ?? '')
  const [color, setColor] = useState<string>(folder?.color ?? PASTEL_COLORS[0].hex)
  const [isImportant, setIsImportant] = useState(folder?.isImportant ?? false)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave({ name: name.trim(), color, isImportant })
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

export function FolderEditSheet({ isOpen, onClose, folder, onSave, onDelete }: FolderEditSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={folder ? 'フォルダを編集' : 'フォルダを追加'}>
      {isOpen && (
        <FolderEditForm key={folder?.id ?? 'new'} folder={folder} onClose={onClose} onSave={onSave} onDelete={onDelete} />
      )}
    </BottomSheet>
  )
}
