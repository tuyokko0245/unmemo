'use client'

import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from './Header'
import { SideDrawer } from './SideDrawer'

interface AppLayoutProps {
  headerTitle?: string
  activeFolderId: string | null
  onFolderSelect: (folderId: string | null) => void
  children: ReactNode
}

export function AppLayout({ headerTitle, activeFolderId, onFolderSelect, children }: AppLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const router = useRouter()

  return (
    <div className="mx-auto flex min-h-dvh max-w-content flex-col bg-bg-primary">
      <Header
        title={headerTitle}
        onMenuClick={() => setIsDrawerOpen(true)}
        onSearchClick={() => router.push('/search')}
      />
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeFolderId={activeFolderId}
        onFolderSelect={onFolderSelect}
      />
      <main className="flex-1 pb-6">{children}</main>
    </div>
  )
}
