'use client'

import { useId, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { useFocusTrap } from '@/hooks/useFocusTrap'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  maxHeight?: string
  children: ReactNode
}

export function BottomSheet({ isOpen, onClose, title, maxHeight = '80vh', children }: BottomSheetProps) {
  const titleId = useId()
  const containerRef = useFocusTrap(isOpen, onClose)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-overlay" onClick={onClose} />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-content rounded-t-lg bg-bg-primary shadow-lg"
        style={{ maxHeight }}
      >
        <div className="flex justify-center pt-2">
          <div className="h-1 w-8 rounded-full bg-border" />
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span id={titleId} className="text-base font-bold text-text-primary">
            {title}
          </span>
          <button type="button" onClick={onClose} aria-label="閉じる" className="p-1 text-text-secondary">
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto px-4 pb-6" style={{ maxHeight: `calc(${maxHeight} - 56px)` }}>
          {children}
        </div>
      </div>
    </div>
  )
}
