import { NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'

const RETENTION_DAYS = 30

function initAdmin() {
  if (getApps().length) return
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

export async function GET(request: Request) {
  const secret = request.headers.get('authorization')?.replace('Bearer ', '')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    initAdmin()
    const db = getFirestore()
    const cutoff = Timestamp.fromMillis(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000)

    const expiredSnap = await db.collectionGroup('memos').where('deletedAt', '<=', cutoff).get()

    const batchSize = 400
    let deleted = 0
    for (let i = 0; i < expiredSnap.docs.length; i += batchSize) {
      const chunk = expiredSnap.docs.slice(i, i + batchSize)
      const batch = db.batch()
      chunk.forEach((doc) => batch.delete(doc.ref))
      await batch.commit()
      deleted += chunk.length
    }

    return NextResponse.json({ ok: true, deleted })
  } catch (e) {
    console.error('[cron/trash-cleanup]', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
