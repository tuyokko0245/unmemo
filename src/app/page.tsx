'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RequireAuth } from '@/components/layout/RequireAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { QuickInputArea } from '@/components/features/QuickInputArea'
import { SortControl } from '@/components/features/SortControl'
import { MemoGrid } from '@/components/features/MemoGrid'
import { useMemos } from '@/hooks/useMemos'
import { useFolders } from '@/hooks/useFolders'
import { useTags } from '@/hooks/useTags'
import { useAuth } from '@/hooks/useAuth'
import { reorderMemos, type SortKey, type SortOrder } from '@/lib/firebase/memos'
import type { Memo } from '@/types'

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const folderParam = searchParams.get('folder')
  const activeFolderId = folderParam === 'none' ? null : folderParam || undefined

  const [sortKey, setSortKey] = useState<SortKey>('updatedAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [isDragMode, setIsDragMode] = useState(false)

  const { folders } = useFolders()
  const { tags } = useTags()
  const { memos, loading } = useMemos(activeFolderId, sortKey, sortOrder)

  const activeFolder = activeFolderId ? folders.find((f) => f.id === activeFolderId) : null
  const headerTitle = activeFolderId === undefined ? 'すべてのメモ' : activeFolder ? activeFolder.name : '未分類'

  const handleToggleDragMode = () => {
    if (!isDragMode) {
      setSortKey('order')
      setSortOrder('asc')
    }
    setIsDragMode((v) => !v)
  }

  const handleReorderMemos = async (reordered: Memo[]) => {
    if (!user) return
    await reorderMemos(user.uid, reordered)
  }

  return (
    <AppLayout
      headerTitle={headerTitle}
      activeFolderId={activeFolderId}
      onFolderSelect={(folderId) => {
        if (folderId === undefined) router.push('/')
        else if (folderId === null) router.push('/?folder=none')
        else router.push(`/?folder=${folderId}`)
      }}
    >
      <QuickInputArea
        key={folderParam ?? 'all'}
        defaultFolderId={activeFolderId === undefined ? null : activeFolderId}
      />
      <SortControl
        sortKey={sortKey}
        sortOrder={sortOrder}
        totalCount={memos.length}
        isDragMode={isDragMode}
        onSortChange={(key, order) => {
          setSortKey(key)
          setSortOrder(order)
        }}
        onToggleDragMode={handleToggleDragMode}
      />
      <MemoGrid
        memos={memos}
        folders={folders}
        tags={tags}
        loading={loading}
        isDragMode={isDragMode}
        onMemoClick={(id) => router.push(`/memo/${id}`)}
        onReorder={handleReorderMemos}
      />
    </AppLayout>
  )
}

export default function HomePage() {
  return (
    <RequireAuth>
      <HomeContent />
    </RequireAuth>
  )
}
