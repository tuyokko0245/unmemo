'use client'

import { useState, useRef, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { FolderItem } from './FolderItem'
import type { Folder } from '@/types'

const NEST_HOVER_DELAY = 700

function getDescendantIds(folderId: string, allFolders: Folder[]): Set<string> {
  const result = new Set<string>()
  const queue = [folderId]
  while (queue.length > 0) {
    const id = queue.shift()!
    allFolders.filter((f) => f.parentId === id).forEach((c) => {
      result.add(c.id)
      queue.push(c.id)
    })
  }
  return result
}

interface FolderTreeProps {
  folders: Folder[]
  allFolders: Folder[]
  activeFolderId: string | null | undefined
  onFolderSelect: (folderId: string | null) => void
  onMenuOpen: (folderId: string) => void
  onReorder: (reordered: Folder[]) => void
  onNest?: (folderId: string, newParentId: string) => void
  depth?: number
  nestTargetId?: string | null
}

function SortableFolderNode({
  folder,
  depth,
  allFolders,
  activeFolderId,
  onFolderSelect,
  onMenuOpen,
  onReorder,
  onNest,
  nestTargetId,
}: {
  folder: Folder
  depth: number
  allFolders: Folder[]
  activeFolderId: string | null | undefined
  onFolderSelect: (folderId: string | null) => void
  onMenuOpen: (folderId: string) => void
  onReorder: (reordered: Folder[]) => void
  onNest?: (folderId: string, newParentId: string) => void
  nestTargetId: string | null
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: folder.id })
  const children = allFolders.filter((f) => f.parentId === folder.id)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <FolderItem
        folder={folder}
        depth={depth}
        isActive={activeFolderId === folder.id}
        isExpanded={isExpanded}
        hasChildren={children.length > 0}
        isNestTarget={nestTargetId === folder.id}
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
          onNest={onNest}
          depth={depth + 1}
        />
      )}
    </div>
  )
}

export function FolderTree({
  folders,
  allFolders,
  activeFolderId,
  onFolderSelect,
  onMenuOpen,
  onReorder,
  onNest,
  depth = 0,
}: FolderTreeProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))
  const [nestTargetId, setNestTargetId] = useState<string | null>(null)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearHoverTimer = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = null
    }
  }, [])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string)
    setNestTargetId(null)
    clearHoverTimer()
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over || over.id === active.id) {
      clearHoverTimer()
      setNestTargetId(null)
      return
    }

    const overId = over.id as string
    const activeId = active.id as string

    // 自分の子孫にはネストできない
    const descendants = getDescendantIds(activeId, allFolders)
    if (descendants.has(overId)) {
      clearHoverTimer()
      setNestTargetId(null)
      return
    }

    if (overId !== nestTargetId) {
      clearHoverTimer()
      setNestTargetId(null)
      hoverTimerRef.current = setTimeout(() => {
        setNestTargetId(overId)
      }, NEST_HOVER_DELAY)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    clearHoverTimer()
    const { active, over } = event
    const currentNestTarget = nestTargetId
    setNestTargetId(null)
    setActiveDragId(null)

    if (!over || active.id === over.id) return

    if (currentNestTarget && currentNestTarget === (over.id as string)) {
      // ネスト操作: active を currentNestTarget のサブフォルダにする
      onNest?.(active.id as string, currentNestTarget)
    } else {
      // 並べ替え操作
      const oldIndex = folders.findIndex((f) => f.id === active.id)
      const newIndex = folders.findIndex((f) => f.id === over.id)
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(arrayMove(folders, oldIndex, newIndex))
      }
    }
  }

  const activeDragFolder = allFolders.find((f) => f.id === activeDragId) ?? null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
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
              onNest={onNest}
              nestTargetId={nestTargetId}
            />
          ))}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeDragFolder && (
          <div className="rounded-lg bg-bg-primary opacity-90 shadow-xl ring-2 ring-base-400">
            <FolderItem
              folder={activeDragFolder}
              depth={0}
              isActive={false}
              isExpanded={false}
              hasChildren={false}
              isNestTarget={false}
              onSelect={() => {}}
              onToggleExpand={() => {}}
              onMenuOpen={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
