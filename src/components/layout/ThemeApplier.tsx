'use client'

import { useEffect } from 'react'
import { useUserSettings } from '@/hooks/useUserSettings'
import { applyBaseColor } from '@/lib/theme'

export function ThemeApplier() {
  const { settings } = useUserSettings()

  useEffect(() => {
    applyBaseColor(settings.baseColor)
  }, [settings.baseColor])

  return null
}
