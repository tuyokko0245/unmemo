'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { subscribeTrashedMemos } from '@/lib/firebase/memos'
import type { Memo } from '@/types'

export function useTrash() {
  const { user } = useAuth()
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeTrashedMemos(user.uid, (data) => {
      setMemos(data)
      setLoading(false)
    })
    return unsubscribe
  }, [user])

  if (!user) {
    return { memos: [], loading: false }
  }

  return { memos, loading }
}
