'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { subscribeTags } from '@/lib/firebase/tags'
import type { Tag } from '@/types'

export function useTags() {
  const { user } = useAuth()
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeTags(user.uid, (data) => {
      setTags(data)
      setLoading(false)
    })
    return unsubscribe
  }, [user])

  if (!user) {
    return { tags: [], loading: false }
  }

  return { tags, loading }
}
