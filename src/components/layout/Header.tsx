'use client'

import { Menu, Search } from 'lucide-react'
import { IconButton } from '@/components/ui/IconButton'

interface HeaderProps {
  title?: string
  onMenuClick: () => void
  onSearchClick: () => void
}

export function Header({ title = 'すべてのメモ', onMenuClick, onSearchClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-base-100 bg-base-50 px-4">
      <IconButton icon={<Menu size={20} className="text-base-500" />} label="メニュー" onClick={onMenuClick} />
      <div className="flex flex-col items-center">
        <span className="text-lg font-extrabold tracking-wide text-base-700">ウンmemo</span>
        <span className="mt-[1px] text-xs font-medium text-base-600">{title}</span>
      </div>
      <IconButton icon={<Search size={19} className="text-base-500" />} label="検索" onClick={onSearchClick} />
    </header>
  )
}
