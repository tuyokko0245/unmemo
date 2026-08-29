import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  serverTimestamp,
  type QueryConstraint,
} from 'firebase/firestore'

import { db } from './config'
import type { Memo } from '@/types'

export type SortKey = 'updatedAt' | 'createdAt' | 'title' | 'order'
export type SortOrder = 'asc' | 'desc'

export function memosCollection(uid: string) {
  return collection(db, 'users', uid, 'memos')
}

export function subscribeMemo(uid: string, memoId: string, callback: (memo: Memo | null) => void) {
  return onSnapshot(doc(db, 'users', uid, 'memos', memoId), (snapshot) => {
    callback(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as Memo) : null)
  })
}

export function subscribeMemos(
  uid: string,
  options: { folderId?: string | null; sortKey: SortKey; sortOrder: SortOrder },
  callback: (memos: Memo[]) => void,
) {
  const constraints: QueryConstraint[] = [where('deletedAt', '==', null)]
  if (options.folderId !== undefined) {
    constraints.push(where('folderId', '==', options.folderId))
  }
  constraints.push(orderBy(options.sortKey, options.sortOrder))

  const q = query(memosCollection(uid), ...constraints)
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Memo))
  })
}

export interface NewMemoInput {
  title: string
  body: string
  folderId: string | null
  tagIds: string[]
}

export async function createMemo(uid: string, input: NewMemoInput) {
  await addDoc(memosCollection(uid), {
    ...input,
    order: Date.now(),
    deletedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateMemo(uid: string, memoId: string, data: Partial<Omit<Memo, 'id' | 'createdAt'>>) {
  await updateDoc(doc(db, 'users', uid, 'memos', memoId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function reorderMemos(uid: string, orderedMemos: Memo[]) {
  const batch = writeBatch(db)
  orderedMemos.forEach((memo, index) => {
    batch.update(doc(db, 'users', uid, 'memos', memo.id), { order: index, updatedAt: serverTimestamp() })
  })
  await batch.commit()
}

export async function moveMemoToTrash(uid: string, memoId: string) {
  await updateDoc(doc(db, 'users', uid, 'memos', memoId), {
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function restoreMemoFromTrash(uid: string, memoId: string) {
  await updateDoc(doc(db, 'users', uid, 'memos', memoId), {
    deletedAt: null,
    updatedAt: serverTimestamp(),
  })
}

export function subscribeTrashedMemos(uid: string, callback: (memos: Memo[]) => void) {
  const q = query(memosCollection(uid), where('deletedAt', '!=', null), orderBy('deletedAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Memo))
  })
}

export async function deleteMemoPermanently(uid: string, memoId: string) {
  await deleteDoc(doc(db, 'users', uid, 'memos', memoId))
}

export async function emptyTrash(uid: string, memoIds: string[]) {
  const batch = writeBatch(db)
  memoIds.forEach((memoId) => {
    batch.delete(doc(db, 'users', uid, 'memos', memoId))
  })
  await batch.commit()
}
