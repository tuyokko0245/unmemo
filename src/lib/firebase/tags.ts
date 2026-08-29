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
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'
import { memosCollection } from './memos'
import type { Tag } from '@/types'

export function tagsCollection(uid: string) {
  return collection(db, 'users', uid, 'tags')
}

export function subscribeTags(uid: string, callback: (tags: Tag[]) => void) {
  const q = query(tagsCollection(uid), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Tag))
  })
}

export async function createTag(uid: string, name: string) {
  await addDoc(tagsCollection(uid), { name, createdAt: serverTimestamp() })
}

export async function updateTag(uid: string, tagId: string, name: string) {
  await updateDoc(doc(db, 'users', uid, 'tags', tagId), { name })
}

export async function deleteTag(uid: string, tagId: string) {
  const memosSnapshot = await getDocs(query(memosCollection(uid), where('tagIds', 'array-contains', tagId)))
  const batch = writeBatch(db)
  memosSnapshot.docs.forEach((memoDoc) => {
    batch.update(memoDoc.ref, { tagIds: arrayRemove(tagId), updatedAt: serverTimestamp() })
  })
  batch.delete(doc(db, 'users', uid, 'tags', tagId))
  await batch.commit()
}
