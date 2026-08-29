'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { subscribeFolders } from '@/lib/firebase/folders'
import type { Folder } from '@/types'

export function useFolders() {
  const { user } = useAuth()
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeFolders(user.uid, (data) => {
      setFolders(data)
      setLoading(false)
    })
    return unsubscribe
  }, [user])

  if (!user) {
    return { folders: [], loading: false }
  }

  return { folders, loading }
}
