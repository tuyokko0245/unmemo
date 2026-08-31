'use client'

import { useState } from 'react'
import Link from 'next/link'
import { X, FileText, CheckSquare, Trash2, Settings, Plus } from 'lucide-react'
import { FolderTree } from '@/components/features/FolderTree'
import { FolderEditSheet } from '@/components/features/FolderEditSheet'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAuth } from '@/hooks/useAuth'
import { useFolders } from '@/hooks/useFolders'
import { useSnackbar } from '@/hooks/useSnackbar'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { createFolder, updateFolder, deleteFolder, reorderFolders } from '@/lib/firebase/folders'
import type { Folder } from '@/types'

interface SideDrawerProps {
  isOpen: boolean
  onClose: () => void
  activeFolderId: string | null | undefined
  onFolderSelect: (folderId: string | null | undefined) => void
}

export function SideDrawer({ isOpen, onClose, activeFolderId, onFolderSelect }: SideDrawerProps) {
  const { user } = useAuth()
  const { folders } = useFolders()
  const { showSnackbar } = useSnackbar()

  const [menuFolderId, setMenuFolderId] = useState<string | null>(null)
  const [editTarget, setEditTarget] = useState<{ folder: Folder | null; parentId: string | null } | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Folder | null>(null)

  const panelRef = useFocusTrap(isOpen, onClose)

  if (!isOpen) return null

  const importantFolders = folders.filter((f) => f.isImportant)
  const regularRootFolders = folders.filter((f) => !f.isImportant && f.parentId === null)
  const menuFolder = folders.find((f) => f.id === menuFolderId) ?? null

  const handleSelect = (folderId: string | null | undefined) => {
    onFolderSelect(folderId)
    onClose()
  }

  const handleSaveFolder = async (data: { name: string; color: string; isImportant: boolean; parentId: string | null }) => {
    if (!user) return
    if (editTarget?.folder) {
      await updateFolder(user.uid, editTarget.folder.id, { name: data.name, color: data.color, isImportant: data.isImportant, parentId: data.parentId })
      showSnackbar({ message: 'フォルダを更新しました' })
    } else {
      const order = Date.now()
      await createFolder(user.uid, {
        name: data.name,
        color: data.color,
        parentId: data.parentId,
        order,
      })
      showSnackbar({ message: 'フォルダを作成しました' })
    }
  }

  const handleNest = async (folderId: string, newParentId: string) => {
    if (!user) return
    await updateFolder(user.uid, folderId, { parentId: newParentId })
    showSnackbar({ message: 'フォルダを移動しました' })
  }

  const handleDelete = async () => {
    if (!user || !deleteTarget) return
    await deleteFolder(user.uid, deleteTarget.id)
    showSnackbar({ message: 'フォルダを削除しました', variant: 'warning' })
    setDeleteTarget(null)
  }

  const handleReorder = async (reordered: Folder[]) => {
    if (!user) return
    await reorderFolders(user.uid, reordered)
  }

  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-overlay" onClick={onClose} />
      <div
        ref={panelRef}
        role="navigation"
        aria-label="フォルダナビゲーション"
        className="relative z-10 flex h-full w-[280px] flex-col bg-bg-primary shadow-lg"
      >
        <div className="flex h-14 min-h-14 items-center justify-between border-b border-border px-4">
          <span className="text-lg font-extrabold text-text-primary">フォルダ</span>
          <button type="button" aria-label="閉じる" onClick={onClose} className="text-text-secondary">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          <div
            className={`flex min-h-touch cursor-pointer items-center gap-2 px-4 ${activeFolderId === undefined ? 'text-base-600 font-extrabold' : 'text-text-primary font-semibold'}`}
            onClick={() => handleSelect(undefined)}
          >
            <FileText size={14} className="text-text-secondary" />
            <span className="text-sm">すべてのメモ</span>
          </div>

          {importantFolders.length > 0 && (
            <>
              <div className="px-4 pb-1 pt-2 text-[11px] font-extrabold text-base-500">★ 重要</div>
              <FolderTree
                folders={importantFolders}
                allFolders={folders}
                activeFolderId={activeFolderId}
                onFolderSelect={handleSelect}
                onMenuOpen={setMenuFolderId}
                onReorder={handleReorder}
                onNest={handleNest}
              />
              <div className="mx-4 my-2 h-px bg-base-100" />
            </>
          )}

          <FolderTree
            folders={regularRootFolders}
            allFolders={folders}
            activeFolderId={activeFolderId}
            onFolderSelect={handleSelect}
            onMenuOpen={setMenuFolderId}
            onReorder={handleReorder}
            onNest={handleNest}
          />

          <div
            className="flex min-h-touch cursor-pointer items-center gap-2 px-4"
            onClick={() => handleSelect(null)}
          >
            <FileText size={14} className="text-text-secondary" />
            <span className="text-sm font-semibold text-text-primary">未分類</span>
          </div>

          <div className="px-4 pb-1 pt-3">
            <button
              type="button"
              className="flex items-center gap-1 text-[13px] font-extrabold text-base-500"
              onClick={() => setEditTarget({ folder: null, parentId: null })}
            >
              <Plus size={14} /> フォルダを追加
            </button>
          </div>

          <div className="mx-4 my-2 h-px bg-border" />

          <Link href="/todo" className="flex min-h-touch items-center gap-2 px-4">
            <CheckSquare size={15} className="text-text-secondary" />
            <span className="text-sm font-semibold text-text-primary">TODOリスト</span>
          </Link>
          <Link href="/trash" className="flex min-h-touch items-center gap-2 px-4">
            <Trash2 size={15} className="text-text-secondary" />
            <span className="text-sm font-semibold text-text-primary">ゴミ箱</span>
          </Link>
          <Link href="/settings" className="flex min-h-touch items-center gap-2 px-4">
            <Settings size={15} className="text-text-secondary" />
            <span className="text-sm font-semibold text-text-primary">設定</span>
          </Link>
        </div>
      </div>

      <BottomSheet isOpen={!!menuFolder} onClose={() => setMenuFolderId(null)} title={menuFolder?.name ?? ''}>
        <div className="flex flex-col">
          <button
            type="button"
            className="min-h-touch text-left text-sm font-semibold text-text-primary"
            onClick={() => {
              if (menuFolder) setEditTarget({ folder: menuFolder, parentId: menuFolder.parentId })
              setMenuFolderId(null)
            }}
          >
            編集
          </button>
          <button
            type="button"
            className="min-h-touch text-left text-sm font-semibold text-text-primary"
            onClick={async () => {
              if (user && menuFolder) {
                await updateFolder(user.uid, menuFolder.id, { isImportant: !menuFolder.isImportant })
              }
              setMenuFolderId(null)
            }}
          >
            {menuFolder?.isImportant ? '重要を解除' : '重要に設定 ★'}
          </button>
          <button
            type="button"
            className="min-h-touch text-left text-sm font-semibold text-text-primary"
            onClick={() => {
              if (menuFolder) setEditTarget({ folder: null, parentId: menuFolder.id })
              setMenuFolderId(null)
            }}
          >
            サブフォルダ追加
          </button>
          <button
            type="button"
            className="min-h-touch text-left text-sm font-semibold text-error"
            onClick={() => {
              setDeleteTarget(menuFolder)
              setMenuFolderId(null)
            }}
          >
            削除
          </button>
        </div>
      </BottomSheet>

      <FolderEditSheet
        isOpen={!!editTarget}
        onClose={() => setEditTarget(null)}
        folder={editTarget?.folder ?? null}
        allFolders={folders}
        onSave={handleSaveFolder}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="フォルダを削除しますか？"
        message={`「${deleteTarget?.name}」を削除します。中のメモは未分類になります。`}
        confirmLabel="削除"
        isDangerous
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
