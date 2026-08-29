'use client'

import { useState } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FolderItem } from './FolderItem'
import type { Folder } from '@/types'

interface FolderTreeProps {
  folders: Folder[]
  allFolders: Folder[]
  activeFolderId: string | null
  onFolderSelect: (folderId: string | null) => void
  onMenuOpen: (folderId: string) => void
  onReorder: (reordered: Folder[]) => void
  depth?: number
}

function SortableFolderNode({
  folder,
  depth,
  allFolders,
  activeFolderId,
  onFolderSelect,
  onMenuOpen,
  onReorder,
}: {
  folder: Folder
  depth: number
  allFolders: Folder[]
  activeFolderId: string | null
  onFolderSelect: (folderId: string | null) => void
  onMenuOpen: (folderId: string) => void
  onReorder: (reordered: Folder[]) => void
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: folder.id })
  const children = allFolders.filter((f) => f.parentId === folder.id)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <FolderItem
        folder={folder}
        depth={depth}
        isActive={activeFolderId === folder.id}
        isExpanded={isExpanded}
        hasChildren={children.length > 0}
        onSelect={() => onFolderSelect(folder.id)}
        onToggleExpand={() => setIsExpanded((v) => !v)}
        onMenuOpen={onMenuOpen}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
      {isExpanded && children.length > 0 && (
        <FolderTree
          folders={children}
          allFolders={allFolders}
          activeFolderId={activeFolderId}
          onFolderSelect={onFolderSelect}
          onMenuOpen={onMenuOpen}
          onReorder={onReorder}
          depth={depth + 1}
        />
      )}
    </div>
  )
}

export function FolderTree({ folders, allFolders, activeFolderId, onFolderSelect, onMenuOpen, onReorder, depth = 0 }: FolderTreeProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = folders.findIndex((f) => f.id === active.id)
    const newIndex = folders.findIndex((f) => f.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    onReorder(arrayMove(folders, oldIndex, newIndex))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={folders.map((f) => f.id)} strategy={verticalListSortingStrategy}>
        <div role={depth === 0 ? 'tree' : 'group'}>
          {folders.map((folder) => (
            <SortableFolderNode
              key={folder.id}
              folder={folder}
              depth={depth}
              allFolders={allFolders}
              activeFolderId={activeFolderId}
              onFolderSelect={onFolderSelect}
              onMenuOpen={onMenuOpen}
              onReorder={onReorder}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
