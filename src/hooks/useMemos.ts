'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { subscribeMemos, type SortKey, type SortOrder } from '@/lib/firebase/memos'
import type { Memo } from '@/types'

export function useMemos(folderId: string | null | undefined, sortKey: SortKey, sortOrder: SortOrder) {
  const { user } = useAuth()
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeMemos(user.uid, { folderId, sortKey, sortOrder }, (data) => {
      setMemos(data)
      setLoading(false)
    })
    return unsubscribe
  }, [user, folderId, sortKey, sortOrder])

  if (!user) {
    return { memos: [], loading: false }
  }

  return { memos, loading }
}
