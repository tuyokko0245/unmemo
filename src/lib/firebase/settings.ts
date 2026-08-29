import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from './config'
import { DEFAULT_BASE_COLOR } from '@/lib/theme'
import type { UserSettings } from '@/types'

function settingsDoc(uid: string) {
  return doc(db, 'users', uid, 'settings', 'userSettings')
}

export function subscribeUserSettings(uid: string, callback: (settings: UserSettings) => void) {
  return onSnapshot(settingsDoc(uid), (snapshot) => {
    callback(snapshot.exists() ? (snapshot.data() as UserSettings) : { baseColor: DEFAULT_BASE_COLOR })
  })
}

export async function updateUserSettings(uid: string, data: Partial<UserSettings>) {
  await setDoc(settingsDoc(uid), data, { merge: true })
}
