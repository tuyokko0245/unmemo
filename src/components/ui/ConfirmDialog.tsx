'use client'

import { useId } from 'react'
import { Button } from './Button'
import { useFocusTrap } from '@/hooks/useFocusTrap'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  isDangerous?: boolean
  onConfirm: () => Promise<void> | void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel = 'キャンセル',
  isDangerous = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId()
  const messageId = useId()
  const containerRef = useFocusTrap(isOpen, onCancel)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center px-6">
      <div className="absolute inset-0 z-[80] bg-overlay" onClick={onCancel} />
      <div
        ref={containerRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        className="relative z-[90] w-full max-w-xs rounded-lg bg-bg-primary p-5 shadow-lg"
      >
        <h2 id={titleId} className="text-base font-bold text-text-primary">
          {title}
        </h2>
        <p id={messageId} className="mt-2 text-sm text-text-secondary">
          {message}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant={isDangerous ? 'danger' : 'primary'} size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
