import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './config'
import type { Todo } from '@/types'

export function todosCollection(uid: string) {
  return collection(db, 'users', uid, 'todos')
}

export function subscribeTodos(uid: string, callback: (todos: Todo[]) => void) {
  const q = query(todosCollection(uid), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Todo))
  })
}

export async function createTodo(uid: string, title: string, memoId: string | null = null) {
  await addDoc(todosCollection(uid), {
    title,
    isCompleted: false,
    memoId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function setTodoCompleted(uid: string, todoId: string, isCompleted: boolean) {
  await updateDoc(doc(db, 'users', uid, 'todos', todoId), {
    isCompleted,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteTodo(uid: string, todoId: string) {
  await deleteDoc(doc(db, 'users', uid, 'todos', todoId))
}

export async function replaceTodosForMemo(uid: string, memoId: string, titles: string[]) {
  const existingSnapshot = await getDocs(query(todosCollection(uid), where('memoId', '==', memoId)))
  const batch = writeBatch(db)
  existingSnapshot.docs.forEach((todoDoc) => {
    batch.delete(todoDoc.ref)
  })
  titles.forEach((title) => {
    const newDoc = doc(todosCollection(uid))
    batch.set(newDoc, {
      title,
      isCompleted: false,
      memoId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  })
  await batch.commit()
}
