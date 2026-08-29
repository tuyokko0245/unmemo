'use client'

import type { ReactNode } from 'react'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      {icon && <div className="text-4xl">{icon}</div>}
      <div className="text-base font-bold text-text-primary">{title}</div>
      {description && <div className="text-sm text-text-secondary">{description}</div>}
      {action && (
        <div className="mt-3">
          <Button size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}
