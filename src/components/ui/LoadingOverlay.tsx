'use client'

interface LoadingOverlayProps {
  isVisible: boolean
  message?: string
}

export function LoadingOverlay({ isVisible, message = 'AIが処理しています...' }: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-3 bg-overlay"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-white border-t-transparent" />
      <span className="text-sm font-bold text-white">{message}</span>
    </div>
  )
}
