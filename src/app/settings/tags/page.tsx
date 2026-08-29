'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus, Tag as TagIcon } from 'lucide-react'
import { RequireAuth } from '@/components/layout/RequireAuth'
import { TagEditSheet } from '@/components/features/TagEditSheet'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAuth } from '@/hooks/useAuth'
import { useTags } from '@/hooks/useTags'
import { useSnackbar } from '@/hooks/useSnackbar'
import { createTag, updateTag, deleteTag } from '@/lib/firebase/tags'
import type { Tag } from '@/types'

function TagsContent() {
  const { user } = useAuth()
  const router = useRouter()
  const { tags, loading } = useTags()
  const { showSnackbar } = useSnackbar()

  const [editTarget, setEditTarget] = useState<{ tag: Tag | null } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Tag | null>(null)

  const handleSave = async (name: string) => {
    if (!user) return
    if (editTarget?.tag) {
      await updateTag(user.uid, editTarget.tag.id, name)
      showSnackbar({ message: 'タグを更新しました' })
    } else {
      await createTag(user.uid, name)
      showSnackbar({ message: 'タグを追加しました' })
    }
  }

  const handleDelete = async () => {
    if (!user || !deleteTarget) return
    await deleteTag(user.uid, deleteTarget.id)
    showSnackbar({ message: 'タグを削除しました', variant: 'warning' })
    setDeleteTarget(null)
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-content flex-col bg-bg-primary">
      <header className="flex h-14 items-center justify-between border-b border-base-100 bg-base-50 px-2">
        <button
          type="button"
          aria-label="戻る"
          onClick={() => router.push('/settings')}
          className="flex h-11 w-11 items-center justify-center text-base-600"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-lg font-extrabold text-base-700">タグ管理</span>
        <button
          type="button"
          onClick={() => setEditTarget({ tag: null })}
          className="flex min-w-11 items-center justify-center gap-0.5 text-[13px] font-extrabold text-base-500"
        >
          <Plus size={16} /> 追加
        </button>
      </header>

      <main className="flex-1 px-4 py-4">
        {loading ? (
          <div className="py-10 text-center text-sm text-text-tertiary">読み込み中...</div>
        ) : tags.length === 0 ? (
          <EmptyState icon="🏷" title="タグはありません" description="右上の＋からタグを追加できます" />
        ) : (
          <div className="overflow-hidden rounded-md bg-bg-card shadow-sm">
            {tags.map((tag, index) => (
              <div
                key={tag.id}
                className={`flex items-center gap-2.5 px-3.5 py-3 ${index < tags.length - 1 ? 'border-b border-border' : ''}`}
              >
                <TagIcon size={14} className="shrink-0 text-text-secondary" />
                <span className="flex-1 text-[15px] text-text-primary">{tag.name}</span>
                <button
                  type="button"
                  onClick={() => setEditTarget({ tag })}
                  className="rounded-sm bg-base-100 px-2.5 py-1.5 text-xs font-bold text-base-700"
                >
                  編集
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(tag)}
                  className="rounded-sm bg-error/10 px-2.5 py-1.5 text-xs font-bold text-error"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <TagEditSheet isOpen={!!editTarget} onClose={() => setEditTarget(null)} tag={editTarget?.tag ?? null} onSave={handleSave} />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="タグを削除しますか？"
        message={`「${deleteTarget?.name}」を削除します。このタグが付いているすべてのメモからも自動的に外れます。`}
        confirmLabel="削除"
        isDangerous
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

export default function TagsPage() {
  return (
    <RequireAuth>
      <TagsContent />
    </RequireAuth>
  )
}
