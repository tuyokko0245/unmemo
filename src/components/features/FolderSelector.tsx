'use client'

import { BottomSheet } from '@/components/ui/BottomSheet'
import type { Folder } from '@/types'

interface FolderSelectorProps {
  isOpen: boolean
  onClose: () => void
  folders: Folder[]
  selectedFolderId: string | null
  onSelect: (folderId: string | null) => void
}

export function FolderSelector({ isOpen, onClose, folders, selectedFolderId, onSelect }: FolderSelectorProps) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="フォルダを選択">
      <div className="flex flex-col">
        <button
          type="button"
          className={`min-h-touch text-left text-sm font-semibold ${selectedFolderId === null ? 'text-base-600' : 'text-text-primary'}`}
          onClick={() => {
            onSelect(null)
            onClose()
          }}
        >
          未分類
        </button>
        {folders.map((folder) => (
          <button
            key={folder.id}
            type="button"
            className={`flex min-h-touch items-center gap-2 text-left text-sm font-semibold ${selectedFolderId === folder.id ? 'text-base-600' : 'text-text-primary'}`}
            onClick={() => {
              onSelect(folder.id)
              onClose()
            }}
          >
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: folder.color }} />
            {folder.name}
          </button>
        ))}
      </div>
    </BottomSheet>
  )
}
