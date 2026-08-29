'use client'

import { useState } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { Tag } from '@/types'

const MAX_LENGTH = 30

interface TagEditSheetProps {
  isOpen: boolean
  onClose: () => void
  tag: Tag | null
  onSave: (name: string) => Promise<void>
}

function TagEditForm({ tag, onClose, onSave }: { tag: Tag | null; onClose: () => void; onSave: (name: string) => Promise<void> }) {
  const [name, setName] = useState(tag?.name ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave(name.trim())
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 pt-2">
      <Input value={name} onChange={setName} placeholder="タグ名を入力...（最大30文字）" maxLength={MAX_LENGTH} autoFocus />
      <div className="text-right text-[11px] text-text-tertiary">
        {name.length}/{MAX_LENGTH}
      </div>
      <div className="flex gap-2.5">
        <Button variant="secondary" fullWidth onClick={onClose}>
          キャンセル
        </Button>
        <Button fullWidth onClick={handleSave} loading={saving} disabled={!name.trim()}>
          保存
        </Button>
      </div>
    </div>
  )
}

export function TagEditSheet({ isOpen, onClose, tag, onSave }: TagEditSheetProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={tag ? 'タグを編集' : 'タグを追加'}>
      {isOpen && <TagEditForm key={tag?.id ?? 'new'} tag={tag} onClose={onClose} onSave={onSave} />}
    </BottomSheet>
  )
}
