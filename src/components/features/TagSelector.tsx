'use client'

import { useState } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { createTag } from '@/lib/firebase/tags'
import type { Tag } from '@/types'

interface TagSelectorProps {
  isOpen: boolean
  onClose: () => void
  tags: Tag[]
  selectedTagIds: string[]
  onChange: (tagIds: string[]) => void
}

export function TagSelector({ isOpen, onClose, tags, selectedTagIds, onChange }: TagSelectorProps) {
  const { user } = useAuth()
  const [newTagName, setNewTagName] = useState('')

  const toggle = (tagId: string) => {
    onChange(selectedTagIds.includes(tagId) ? selectedTagIds.filter((id) => id !== tagId) : [...selectedTagIds, tagId])
  }

  const handleCreate = async () => {
    if (!user || !newTagName.trim()) return
    await createTag(user.uid, newTagName.trim())
    setNewTagName('')
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="タグを選択">
      <div className="flex flex-col gap-4 pt-2">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => {
            const selected = selectedTagIds.includes(tag.id)
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggle(tag.id)}
                className={`rounded-sm px-3 py-1.5 text-xs font-bold ${
                  selected ? 'bg-base-500 text-white' : 'bg-bg-secondary text-text-primary'
                }`}
              >
                #{tag.name}
              </button>
            )
          })}
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input value={newTagName} onChange={setNewTagName} placeholder="新しいタグ名" maxLength={30} />
          </div>
          <Button size="md" onClick={handleCreate} disabled={!newTagName.trim()}>
            追加
          </Button>
        </div>
        <Button fullWidth variant="secondary" onClick={onClose}>
          完了
        </Button>
      </div>
    </BottomSheet>
  )
}
