import type { Timestamp } from 'firebase/firestore'

export interface Folder {
  id: string
  name: string
  color: string
  parentId: string | null
  isImportant: boolean
  order: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Memo {
  id: string
  title: string
  body: string
  color: string | null
  folderId: string | null
  tagIds: string[]
  order: number
  deletedAt: Timestamp | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Tag {
  id: string
  name: string
  createdAt: Timestamp
}

export interface Todo {
  id: string
  title: string
  isCompleted: boolean
  memoId: string | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface UserSettings {
  baseColor: string
}
