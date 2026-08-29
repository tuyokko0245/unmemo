'use client'

import { Check, Trash2 } from 'lucide-react'
import type { Todo } from '@/types'

interface TodoItemProps {
  todo: Todo
  memoLabel: string | null
  onToggle: () => void
  onDelete: () => void
  onMemoClick: () => void
}

export function TodoItem({ todo, memoLabel, onToggle, onDelete, onMemoClick }: TodoItemProps) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-md p-2.5 shadow-sm ${
        todo.isCompleted ? 'bg-bg-secondary' : 'bg-bg-card'
      }`}
    >
      <button
        type="button"
        aria-label={todo.isCompleted ? '未完了に戻す' : '完了にする'}
        onClick={onToggle}
        className="flex h-11 w-11 shrink-0 items-center justify-center"
      >
        <span
          className={`flex h-[22px] w-[22px] items-center justify-center rounded-[7px] border-2 transition-colors ${
            todo.isCompleted ? 'border-base-300 bg-base-300 text-white' : 'border-base-200 bg-transparent'
          }`}
        >
          {todo.isCompleted && <Check size={13} strokeWidth={3} />}
        </span>
      </button>

      <div className="flex-1 pt-2.5">
        <div
          className={`text-[15px] leading-snug transition-colors ${
            todo.isCompleted ? 'text-text-tertiary line-through' : 'text-text-primary'
          }`}
        >
          {todo.title}
        </div>
        {memoLabel && (
          <button
            type="button"
            onClick={onMemoClick}
            className="mt-1 block text-xs text-text-tertiary underline-offset-2 hover:underline"
          >
            📝 元メモ: {memoLabel}
          </button>
        )}
      </div>

      <button
        type="button"
        aria-label="TODOを削除"
        onClick={onDelete}
        className="flex h-11 w-9 shrink-0 items-center justify-center text-text-tertiary"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}
