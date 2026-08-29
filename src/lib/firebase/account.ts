import { collection, getDocs, writeBatch, type CollectionReference, type DocumentData } from 'firebase/firestore'
import { db } from './config'

const BATCH_SIZE = 400
const USER_SUBCOLLECTIONS = ['folders', 'memos', 'tags', 'todos', 'settings']

async function deleteAllDocsInCollection(ref: CollectionReference<DocumentData>) {
  const snapshot = await getDocs(ref)
  for (let i = 0; i < snapshot.docs.length; i += BATCH_SIZE) {
    const chunk = snapshot.docs.slice(i, i + BATCH_SIZE)
    const batch = writeBatch(db)
    chunk.forEach((docSnap) => batch.delete(docSnap.ref))
    await batch.commit()
  }
}

export async function deleteAllUserData(uid: string) {
  for (const sub of USER_SUBCOLLECTIONS) {
    await deleteAllDocsInCollection(collection(db, 'users', uid, sub))
  }
}
