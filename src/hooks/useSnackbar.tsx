'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

export type SnackbarVariant = 'success' | 'error' | 'warning' | 'info'

interface SnackbarOptions {
  message: string
  variant?: SnackbarVariant
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface SnackbarState extends SnackbarOptions {
  id: number
}

interface SnackbarContextValue {
  showSnackbar: (options: SnackbarOptions) => void
}

const SnackbarContext = createContext<SnackbarContextValue | null>(null)

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snackbar, setSnackbar] = useState<SnackbarState | null>(null)

  const showSnackbar = useCallback((options: SnackbarOptions) => {
    const id = Date.now()
    setSnackbar({ id, variant: 'success', duration: 3000, ...options })
    window.setTimeout(() => {
      setSnackbar((current) => (current?.id === id ? null : current))
    }, options.duration ?? 3000)
  }, [])

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 z-40 w-[calc(100%-32px)] max-w-sm -translate-x-1/2">
        {snackbar && (
          <div
            className={[
              'flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg',
              snackbar.variant === 'error' && 'bg-[color:var(--color-error)]',
              snackbar.variant === 'warning' && 'bg-[color:var(--color-warning)]',
              snackbar.variant === 'info' && 'bg-[color:var(--color-base-600)]',
              (!snackbar.variant || snackbar.variant === 'success') && 'bg-[color:var(--color-base-500)]',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span>{snackbar.message}</span>
            {snackbar.action && (
              <button
                type="button"
                onClick={snackbar.action.onClick}
                className="shrink-0 font-bold underline underline-offset-2"
              >
                {snackbar.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </SnackbarContext.Provider>
  )
}

export function useSnackbar() {
  const context = useContext(SnackbarContext)
  if (!context) throw new Error('useSnackbar must be used within SnackbarProvider')
  return context
}
