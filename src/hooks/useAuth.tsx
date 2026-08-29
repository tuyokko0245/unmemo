'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  type User,
} from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { deleteAllUserData } from '@/lib/firebase/account'

interface AuthContextValue {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  reauthenticateWithGoogle: () => Promise<void>
  reauthenticateWithPassword: (password: string) => Promise<void>
  deleteAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    signInWithGoogle: async () => {
      await signInWithPopup(auth, new GoogleAuthProvider())
    },
    signInWithEmail: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password)
    },
    signUpWithEmail: async (email, password) => {
      await createUserWithEmailAndPassword(auth, email, password)
    },
    signOut: async () => {
      await firebaseSignOut(auth)
    },
    reauthenticateWithGoogle: async () => {
      if (!auth.currentUser) throw new Error('not signed in')
      await reauthenticateWithPopup(auth.currentUser, new GoogleAuthProvider())
    },
    reauthenticateWithPassword: async (password) => {
      if (!auth.currentUser?.email) throw new Error('not signed in')
      const credential = EmailAuthProvider.credential(auth.currentUser.email, password)
      await reauthenticateWithCredential(auth.currentUser, credential)
    },
    deleteAccount: async () => {
      if (!auth.currentUser) throw new Error('not signed in')
      await deleteAllUserData(auth.currentUser.uid)
      await deleteUser(auth.currentUser)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
