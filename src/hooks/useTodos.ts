'use client'

import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { subscribeTodos } from '@/lib/firebase/todos'
import type { Todo } from '@/types'

export function useTodos() {
  const { user } = useAuth()
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeTodos(user.uid, (data) => {
      setTodos(data)
      setLoading(false)
    })
    return unsubscribe
  }, [user])

  if (!user) {
    return { todos: [], loading: false }
  }

  return { todos, loading }
}
