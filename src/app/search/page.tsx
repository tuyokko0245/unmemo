'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Search, X } from 'lucide-react'
import { RequireAuth } from '@/components/layout/RequireAuth'
import { FilterBar } from '@/components/features/FilterBar'
import { SearchResultCard } from '@/components/features/SearchResultCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { useFolders } from '@/hooks/useFolders'
import { useTags } from '@/hooks/useTags'
import { useMemos } from '@/hooks/useMemos'
import { useDebounce } from '@/hooks/useDebounce'
import { useRecentSearches } from '@/hooks/useRecentSearches'
import { matchesQuery } from '@/lib/search'

function SearchContent() {
  const router = useRouter()
  const { folders } = useFolders()
  const { tags } = useTags()
  const { memos, loading } = useMemos(undefined, 'updatedAt', 'desc')
  const { recentSearches, addRecentSearch, clearRecentSearches } = useRecentSearches()

  const [query, setQuery] = useState('')
  const [folderId, setFolderId] = useState<string | null>(null)
  const [tagIds, setTagIds] = useState<string[]>([])
  const debouncedQuery = useDebounce(query, 250)

  const results = memos
    .filter((memo) => (folderId === null ? true : memo.folderId === folderId))
    .filter((memo) => (tagIds.length === 0 ? true : tagIds.every((id) => memo.tagIds.includes(id))))
    .filter((memo) => {
      const folder = memo.folderId ? (folders.find((f) => f.id === memo.folderId) ?? null) : null
      const memoTags = tags.filter((t) => memo.tagIds.includes(t.id))
      return matchesQuery(memo, folder, memoTags, debouncedQuery)
    })

  const hasQuery = debouncedQuery.trim().length > 0
  const showResults = hasQuery || folderId !== null || tagIds.length > 0

  const commitSearch = (term: string) => {
    if (term.trim()) addRecentSearch(term.trim())
  }

  const handleMemoClick = (id: string) => {
    commitSearch(query)
    router.push(`/memo/${id}`)
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-content flex-col bg-base-50">
      <div className="flex min-h-14 items-center gap-2 px-4 py-2">
        <button
          type="button"
          aria-label="戻る"
          onClick={() => router.push('/')}
          className="flex h-11 w-9 shrink-0 items-center justify-center text-base-600"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex h-11 flex-1 items-center gap-2 rounded-full bg-bg-primary px-3.5 shadow-sm">
          <Search size={15} className="text-text-tertiary" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitSearch(query)
            }}
            placeholder="メモ・フォルダ・タグを検索"
            autoFocus
            className="flex-1 bg-transparent text-sm text-text-primary outline-none"
          />
          {query && (
            <button type="button" aria-label="検索語をクリア" onClick={() => setQuery('')} className="text-text-tertiary">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <FilterBar
        folders={folders}
        tags={tags}
        folderId={folderId}
        tagIds={tagIds}
        onFolderChange={setFolderId}
        onTagIdsChange={setTagIds}
      />

      <div className="flex-1 px-4 pb-6">
        {!showResults ? (
          recentSearches.length > 0 ? (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-text-secondary">最近の検索</span>
                <button type="button" onClick={clearRecentSearches} className="text-xs text-text-tertiary">
                  クリア
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="rounded-full bg-bg-primary px-3 py-1.5 text-xs font-semibold text-text-primary shadow-sm"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <EmptyState icon="🔍" title="メモを検索" description="キーワード・フォルダ・タグで絞り込めます" />
          )
        ) : loading ? (
          <div className="py-10 text-center text-sm text-text-tertiary">読み込み中...</div>
        ) : results.length === 0 ? (
          <EmptyState icon="🔍" title="見つかりませんでした" description="別のキーワードで試してみてください" />
        ) : (
          <div>
            {hasQuery && (
              <div className="mb-2.5 text-xs text-text-secondary">
                &quot;{debouncedQuery}&quot;の検索結果: {results.length}件
              </div>
            )}
            <div className="flex flex-col gap-3">
              {results.map((memo) => {
                const folder = memo.folderId ? (folders.find((f) => f.id === memo.folderId) ?? null) : null
                const memoTags = tags.filter((t) => memo.tagIds.includes(t.id))
                return (
                  <SearchResultCard
                    key={memo.id}
                    memo={memo}
                    folder={folder}
                    tags={memoTags}
                    query={debouncedQuery}
                    onClick={handleMemoClick}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <RequireAuth>
      <SearchContent />
    </RequireAuth>
  )
}
