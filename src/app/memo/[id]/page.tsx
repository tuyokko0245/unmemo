'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Trash2, Share2, Sparkles } from 'lucide-react'
import { RequireAuth } from '@/components/layout/RequireAuth'
import { IconButton } from '@/components/ui/IconButton'
import { Button } from '@/components/ui/Button'
import { ColorDot } from '@/components/ui/ColorDot'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { LoadingOverlay } from '@/components/ui/LoadingOverlay'
import { MemoForm } from '@/components/features/MemoForm'
import { useMemoDoc } from '@/hooks/useMemoDoc'
import { useFolders } from '@/hooks/useFolders'
import { useTags } from '@/hooks/useTags'
import { useAuth } from '@/hooks/useAuth'
import { useSnackbar } from '@/hooks/useSnackbar'
import { updateMemo, moveMemoToTrash, restoreMemoFromTrash } from '@/lib/firebase/memos'
import { replaceTodosForMemo } from '@/lib/firebase/todos'
import { extractTodosFromMemo } from '@/lib/ai/extractTodos'
import { PASTEL_COLORS, assignRandomPastel } from '@/lib/constants'
import type { Memo } from '@/types'

function formatDateTime(timestampMillis: number) {
  const date = new Date(timestampMillis)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function MemoEditor({ memo }: { memo: Memo }) {
  const { user } = useAuth()
  const { folders } = useFolders()
  const { tags } = useTags()
  const { showSnackbar } = useSnackbar()
  const router = useRouter()

  const [initialMemo] = useState(memo)
  const [title, setTitle] = useState(memo.title)
  const [body, setBody] = useState(memo.body)
  const [folderId, setFolderId] = useState(memo.folderId)
  const [tagIds, setTagIds] = useState(memo.tagIds)
  const [color, setColor] = useState<string | null>(memo.color ?? null)
  const [isSaving, setIsSaving] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [showBackConfirm, setShowBackConfirm] = useState(false)

  const folderColor = folderId ? (folders.find((f) => f.id === folderId)?.color ?? null) : null
  const resolvedColor = color ?? folderColor ?? assignRandomPastel(memo.id)

  const hasChanges =
    title !== initialMemo.title ||
    body !== initialMemo.body ||
    folderId !== initialMemo.folderId ||
    tagIds.join(',') !== initialMemo.tagIds.join(',') ||
    color !== (initialMemo.color ?? null)

  const handleBack = () => {
    if (hasChanges) {
      setShowBackConfirm(true)
      return
    }
    router.push('/')
  }

  const handleSave = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      await updateMemo(user.uid, memo.id, { title: title.trim(), body: body.trim(), folderId, tagIds, color })
      showSnackbar({ message: 'メモを保存しました' })
      router.push('/')
    } finally {
      setIsSaving(false)
    }
  }

  const handleTrash = async () => {
    if (!user) return
    await moveMemoToTrash(user.uid, memo.id)
    showSnackbar({
      message: 'ゴミ箱に移動しました',
      variant: 'warning',
      duration: 5000,
      action: {
        label: '元に戻す',
        onClick: () => restoreMemoFromTrash(user.uid, memo.id),
      },
    })
    router.push('/')
  }

  const handleShare = async () => {
    const shareData = { title: title || '無題のメモ', text: body }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // ユーザーによるキャンセルは無視
      }
      return
    }
    await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}`)
    showSnackbar({ message: 'クリップボードにコピーしました' })
  }

  const handleExtractTodo = async () => {
    if (!user || !body.trim()) return
    setIsExtracting(true)
    try {
      const titles = await extractTodosFromMemo(body)
      await replaceTodosForMemo(user.uid, memo.id, titles)
      if (titles.length === 0) {
        showSnackbar({ message: 'TODOは見つかりませんでした', variant: 'info' })
      } else {
        showSnackbar({
          message: `${titles.length}件のTODOを抽出しました`,
          action: { label: '確認する', onClick: () => router.push('/todo') },
        })
      }
    } catch {
      showSnackbar({ message: 'TODO抽出に失敗しました', variant: 'error' })
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-content flex-col bg-bg-primary">
      <header className="sticky top-0 z-30" style={{ backgroundColor: resolvedColor }}>
        <div className="flex h-14 items-center justify-between px-2">
          <IconButton icon={<ChevronLeft size={20} />} label="戻る" onClick={handleBack} />
          <div className="flex items-center gap-1">
            <IconButton icon={<Trash2 size={18} />} label="ゴミ箱に移動" onClick={handleTrash} />
            <IconButton icon={<Share2 size={18} />} label="共有" onClick={handleShare} />
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto px-3 pb-3 [scrollbar-width:none]">
          {PASTEL_COLORS.map((c) => (
            <ColorDot
              key={c.hex}
              color={c.hex}
              colorName={c.name}
              isSelected={color === c.hex}
              size="sm"
              onClick={() => setColor(c.hex)}
            />
          ))}
          <button
            type="button"
            onClick={() => setColor(null)}
            className="shrink-0 rounded-md bg-white/40 px-2.5 py-1 text-xs font-medium text-[#2E2E2E]"
          >
            リセット
          </button>
        </div>
      </header>

      <main className="flex-1 pb-8">
        <MemoForm
          title={title}
          body={body}
          folderId={folderId}
          tagIds={tagIds}
          folders={folders}
          tags={tags}
          onTitleChange={setTitle}
          onBodyChange={setBody}
          onFolderChange={setFolderId}
          onTagIdsChange={setTagIds}
        />

        <div className="flex flex-col gap-3 px-4">
          <Button
            variant="secondary"
            leftIcon={<Sparkles size={16} />}
            onClick={handleExtractTodo}
            disabled={!body.trim() || isExtracting}
          >
            TODO抽出
          </Button>
          <Button fullWidth onClick={handleSave} loading={isSaving}>
            保存
          </Button>
          <div className="text-xs text-text-tertiary">
            {memo.createdAt && `作成: ${formatDateTime(memo.createdAt.toMillis())}`}
            {memo.createdAt && memo.updatedAt && ' / '}
            {memo.updatedAt && `更新: ${formatDateTime(memo.updatedAt.toMillis())}`}
          </div>
        </div>
      </main>

      <LoadingOverlay isVisible={isExtracting} />

      <ConfirmDialog
        isOpen={showBackConfirm}
        title="変更を破棄しますか？"
        message="保存していない変更があります。このまま戻ると変更内容は失われます。"
        confirmLabel="破棄して戻る"
        isDangerous
        onConfirm={() => {
          setShowBackConfirm(false)
          router.push('/')
        }}
        onCancel={() => setShowBackConfirm(false)}
      />
    </div>
  )
}

export default function MemoEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { memo, loading } = useMemoDoc(id)

  return (
    <RequireAuth>
      {loading ? (
        <div className="flex min-h-dvh items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-base-500 border-t-transparent" />
        </div>
      ) : memo ? (
        <MemoEditor key={memo.id} memo={memo} />
      ) : (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-2 text-text-secondary">
          <p>メモが見つかりませんでした</p>
        </div>
      )}
    </RequireAuth>
  )
}
