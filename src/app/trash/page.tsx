'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, AlertTriangle } from 'lucide-react'
import { RequireAuth } from '@/components/layout/RequireAuth'
import { TrashCard } from '@/components/features/TrashCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useTrash } from '@/hooks/useTrash'
import { useAuth } from '@/hooks/useAuth'
import { useSnackbar } from '@/hooks/useSnackbar'
import { restoreMemoFromTrash, deleteMemoPermanently, emptyTrash } from '@/lib/firebase/memos'

function TrashContent() {
  const { user } = useAuth()
  const router = useRouter()
  const { memos, loading } = useTrash()
  const { showSnackbar } = useSnackbar()

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isEmptyConfirmOpen, setIsEmptyConfirmOpen] = useState(false)

  const handleRestore = async (memoId: string) => {
    if (!user) return
    await restoreMemoFromTrash(user.uid, memoId)
    showSnackbar({ message: 'メモを復元しました' })
  }

  const handleDeleteForever = async () => {
    if (!user || !deleteTargetId) return
    await deleteMemoPermanently(user.uid, deleteTargetId)
    showSnackbar({ message: 'メモを完全に削除しました', variant: 'warning' })
    setDeleteTargetId(null)
  }

  const handleEmptyTrash = async () => {
    if (!user) return
    await emptyTrash(
      user.uid,
      memos.map((m) => m.id),
    )
    showSnackbar({ message: 'ゴミ箱を空にしました', variant: 'warning' })
    setIsEmptyConfirmOpen(false)
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-content flex-col bg-bg-primary">
      <header className="flex h-14 items-center justify-between border-b border-base-100 bg-base-50 px-2">
        <button
          type="button"
          aria-label="戻る"
          onClick={() => router.push('/')}
          className="flex h-11 w-11 items-center justify-center text-base-600"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-lg font-extrabold text-base-700">ゴミ箱</span>
        <button
          type="button"
          onClick={() => setIsEmptyConfirmOpen(true)}
          disabled={memos.length === 0}
          className="min-w-11 px-2 text-[13px] font-extrabold text-error disabled:opacity-40"
        >
          空にする
        </button>
      </header>

      {memos.length > 0 && (
        <div className="mx-4 mt-3 flex items-start gap-1.5 rounded-md bg-bg-secondary px-3 py-2.5 text-xs text-text-secondary">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          <span>ゴミ箱のメモは30日後に自動削除されます</span>
        </div>
      )}

      <main className="flex-1 px-4 py-4">
        {loading ? (
          <div className="py-10 text-center text-sm text-text-tertiary">読み込み中...</div>
        ) : memos.length === 0 ? (
          <EmptyState icon="🗑" title="ゴミ箱は空です" description="削除したメモはここに30日間保存されます" />
        ) : (
          <div className="flex flex-col gap-3">
            {memos.map((memo) => (
              <TrashCard
                key={memo.id}
                memo={memo}
                onRestore={() => handleRestore(memo.id)}
                onDeleteForever={() => setDeleteTargetId(memo.id)}
              />
            ))}
          </div>
        )}
      </main>

      <ConfirmDialog
        isOpen={!!deleteTargetId}
        title="完全に削除しますか？"
        message="この操作は取り消せません。メモは完全に削除されます。"
        confirmLabel="完全削除"
        isDangerous
        onConfirm={handleDeleteForever}
        onCancel={() => setDeleteTargetId(null)}
      />

      <ConfirmDialog
        isOpen={isEmptyConfirmOpen}
        title="ゴミ箱を空にしますか？"
        message={`ゴミ箱内の${memos.length}件のメモをすべて完全に削除します。この操作は取り消せません。`}
        confirmLabel="空にする"
        isDangerous
        onConfirm={handleEmptyTrash}
        onCancel={() => setIsEmptyConfirmOpen(false)}
      />
    </div>
  )
}

export default function TrashPage() {
  return (
    <RequireAuth>
      <TrashContent />
    </RequireAuth>
  )
}
