import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'
import type { Folder } from '@/types'

export function foldersCollection(uid: string) {
  return collection(db, 'users', uid, 'folders')
}

export function subscribeFolders(uid: string, callback: (folders: Folder[]) => void) {
  const q = query(foldersCollection(uid), orderBy('order', 'asc'))
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Folder))
  })
}

export interface NewFolderInput {
  name: string
  color: string
  parentId: string | null
  order: number
}

export async function createFolder(uid: string, input: NewFolderInput) {
  await addDoc(foldersCollection(uid), {
    ...input,
    isImportant: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateFolder(uid: string, folderId: string, data: Partial<Omit<Folder, 'id' | 'createdAt'>>) {
  await updateDoc(doc(db, 'users', uid, 'folders', folderId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export async function reorderFolders(uid: string, orderedFolders: Folder[]) {
  const batch = writeBatch(db)
  orderedFolders.forEach((folder, index) => {
    batch.update(doc(db, 'users', uid, 'folders', folder.id), { order: index, updatedAt: serverTimestamp() })
  })
  await batch.commit()
}

export async function deleteFolder(uid: string, folderId: string) {
  const memosSnapshot = await getDocs(query(collection(db, 'users', uid, 'memos'), where('folderId', '==', folderId)))
  const batch = writeBatch(db)
  memosSnapshot.docs.forEach((memoDoc) => {
    batch.update(memoDoc.ref, { folderId: null, updatedAt: serverTimestamp() })
  })
  batch.delete(doc(db, 'users', uid, 'folders', folderId))
  await batch.commit()
}
