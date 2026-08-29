'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus, ChevronRight } from 'lucide-react'
import { RequireAuth } from '@/components/layout/RequireAuth'
import { TodoItem } from '@/components/features/TodoItem'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { useTodos } from '@/hooks/useTodos'
import { useMemos } from '@/hooks/useMemos'
import { useAuth } from '@/hooks/useAuth'
import { createTodo, setTodoCompleted, deleteTodo } from '@/lib/firebase/todos'

function formatDate(timestampMillis: number) {
  const date = new Date(timestampMillis)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

function TodoContent() {
  const { user } = useAuth()
  const router = useRouter()
  const { todos, loading } = useTodos()
  const { memos } = useMemos(undefined, 'updatedAt', 'desc')

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false)
  const [newTodoTitle, setNewTodoTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isCompletedOpen, setIsCompletedOpen] = useState(false)

  const incomplete = todos.filter((t) => !t.isCompleted)
  const completed = todos.filter((t) => t.isCompleted)

  const memoLabelFor = (memoId: string | null) => {
    if (!memoId) return null
    const memo = memos.find((m) => m.id === memoId)
    if (!memo) return null
    const dateMillis = memo.updatedAt?.toMillis?.()
    return dateMillis ? `${memo.title || '無題のメモ'} ${formatDate(dateMillis)}` : memo.title || '無題のメモ'
  }

  const handleAdd = async () => {
    if (!user || !newTodoTitle.trim()) return
    setIsAdding(true)
    try {
      await createTodo(user.uid, newTodoTitle.trim(), null)
      setNewTodoTitle('')
      setIsAddSheetOpen(false)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-content flex-col bg-bg-primary">
      <header className="flex h-14 items-center justify-between border-b border-base-100 bg-base-50 px-2">
        <button
          type="button"
          aria-label="戻る"
          onClick={() => router.push('/')}
          className="flex h-11 w-11 items-center justify-center text-text-primary"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-lg font-extrabold text-text-primary">TODOリスト</span>
        <button
          type="button"
          aria-label="TODOを追加"
          onClick={() => setIsAddSheetOpen(true)}
          className="flex h-11 w-11 items-center justify-center text-base-500"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </header>

      <main className="flex-1 px-4 py-4">
        {loading ? (
          <div className="py-10 text-center text-sm text-text-tertiary">読み込み中...</div>
        ) : todos.length === 0 ? (
          <EmptyState icon="✅" title="TODOはありません" description="右上の＋からTODOを追加できます" />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="pl-0.5 text-xs font-extrabold text-text-secondary">未完了 {incomplete.length}件</div>
            {incomplete.length === 0 ? (
              <div className="py-2 text-xs text-text-tertiary">未完了のTODOはありません</div>
            ) : (
              incomplete.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  memoLabel={memoLabelFor(todo.memoId)}
                  onToggle={() => user && setTodoCompleted(user.uid, todo.id, true)}
                  onDelete={() => user && deleteTodo(user.uid, todo.id)}
                  onMemoClick={() => todo.memoId && router.push(`/memo/${todo.memoId}`)}
                />
              ))
            )}

            {completed.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setIsCompletedOpen((v) => !v)}
                  className="flex items-center gap-1.5 pl-0.5 pt-2 text-xs font-extrabold text-text-secondary"
                >
                  <ChevronRight
                    size={12}
                    className={`transition-transform ${isCompletedOpen ? 'rotate-90' : ''}`}
                  />
                  完了済みを表示 ({completed.length}件)
                </button>
                {isCompletedOpen && (
                  <div className="flex flex-col gap-3">
                    {completed.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        memoLabel={memoLabelFor(todo.memoId)}
                        onToggle={() => user && setTodoCompleted(user.uid, todo.id, false)}
                        onDelete={() => user && deleteTodo(user.uid, todo.id)}
                        onMemoClick={() => todo.memoId && router.push(`/memo/${todo.memoId}`)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      <BottomSheet isOpen={isAddSheetOpen} onClose={() => setIsAddSheetOpen(false)} title="TODOを追加">
        <div className="flex flex-col gap-4 pt-2">
          <Input value={newTodoTitle} onChange={setNewTodoTitle} placeholder="タスク内容を入力..." maxLength={200} autoFocus />
          <div className="flex gap-2.5">
            <Button variant="secondary" fullWidth onClick={() => setIsAddSheetOpen(false)}>
              キャンセル
            </Button>
            <Button fullWidth onClick={handleAdd} loading={isAdding} disabled={!newTodoTitle.trim()}>
              追加
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  )
}

export default function TodoPage() {
  return (
    <RequireAuth>
      <TodoContent />
    </RequireAuth>
  )
}
