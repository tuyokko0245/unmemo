'use client'

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { MemoCard } from './MemoCard'
import { SkeletonCard } from '@/components/ui/SkeletonCard'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Folder, Memo, Tag } from '@/types'

interface MemoGridProps {
  memos: Memo[]
  folders: Folder[]
  tags: Tag[]
  loading: boolean
  isDragMode: boolean
  onMemoClick: (id: string) => void
  onReorder: (reordered: Memo[]) => void
}

function SortableMemoCard({
  memo,
  folderColor,
  memoTags,
  isDragMode,
  onMemoClick,
}: {
  memo: Memo
  folderColor: string | null
  memoTags: Tag[]
  isDragMode: boolean
  onMemoClick: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: memo.id })
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <MemoCard
        memo={memo}
        folderColor={folderColor}
        tags={memoTags}
        onClick={onMemoClick}
        isDragMode={isDragMode}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  )
}

export function MemoGrid({ memos, folders, tags, loading, isDragMode, onMemoClick, onReorder }: MemoGridProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 px-4 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (memos.length === 0) {
    return <EmptyState icon="📝" title="メモがありません" description="上の入力欄からメモを書いてみましょう" />
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = memos.findIndex((m) => m.id === active.id)
    const newIndex = memos.findIndex((m) => m.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    onReorder(arrayMove(memos, oldIndex, newIndex))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={memos.map((m) => m.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-3 px-4 lg:grid-cols-4">
          {memos.map((memo) => {
            const folder = memo.folderId ? folders.find((f) => f.id === memo.folderId) : undefined
            const memoTags = tags.filter((t) => memo.tagIds.includes(t.id))
            return (
              <SortableMemoCard
                key={memo.id}
                memo={memo}
                folderColor={folder?.color ?? null}
                memoTags={memoTags}
                isDragMode={isDragMode}
                onMemoClick={onMemoClick}
              />
            )
          })}
        </div>
      </SortableContext>
    </DndContext>
  )
}
