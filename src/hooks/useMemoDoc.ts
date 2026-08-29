'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { subscribeMemo } from '@/lib/firebase/memos'
import type { Memo } from '@/types'

export function useMemoDoc(memoId: string) {
  const { user } = useAuth()
  const [memo, setMemo] = useState<Memo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeMemo(user.uid, memoId, (data) => {
      setMemo(data)
      setLoading(false)
    })
    return unsubscribe
  }, [user, memoId])

  if (!user) {
    return { memo: null, loading: false }
  }

  return { memo, loading }
}
