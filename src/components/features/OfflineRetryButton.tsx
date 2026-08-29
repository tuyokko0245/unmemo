'use client'

import { Button } from '@/components/ui/Button'

export function OfflineRetryButton() {
  return (
    <Button onClick={() => window.location.reload()}>
      再試行する
    </Button>
  )
}
