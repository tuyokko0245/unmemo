'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { subscribeUserSettings } from '@/lib/firebase/settings'
import { DEFAULT_BASE_COLOR } from '@/lib/theme'
import type { UserSettings } from '@/types'

export function useUserSettings() {
  const { user } = useAuth()
  const [settings, setSettings] = useState<UserSettings>({ baseColor: DEFAULT_BASE_COLOR })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeUserSettings(user.uid, (data) => {
      setSettings(data)
      setLoading(false)
    })
    return unsubscribe
  }, [user])

  if (!user) {
    return { settings: { baseColor: DEFAULT_BASE_COLOR }, loading: false }
  }

  return { settings, loading }
}
