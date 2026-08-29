'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, LogOut, Tag as TagIcon, UserX } from 'lucide-react'
import { RequireAuth } from '@/components/layout/RequireAuth'
import { ColorDot } from '@/components/ui/ColorDot'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AccountDeleteSheet } from '@/components/features/AccountDeleteSheet'
import { useAuth } from '@/hooks/useAuth'
import { useUserSettings } from '@/hooks/useUserSettings'
import { useSnackbar } from '@/hooks/useSnackbar'
import { updateUserSettings } from '@/lib/firebase/settings'
import { applyBaseColor, BASE_COLOR_THEMES } from '@/lib/theme'

function SettingsContent() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { settings } = useUserSettings()
  const { showSnackbar } = useSnackbar()

  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false)
  const [isDeleteSheetOpen, setIsDeleteSheetOpen] = useState(false)

  const handleSelectColor = async (hex: string) => {
    if (!user) return
    applyBaseColor(hex)
    await updateUserSettings(user.uid, { baseColor: hex })
    showSnackbar({ message: 'ベースカラーを変更しました' })
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-content flex-col bg-bg-primary">
      <header className="flex h-14 items-center justify-between border-b border-base-100 bg-base-50 px-2">
        <button
          type="button"
          aria-label="戻る"
          onClick={() => router.push('/')}
          className="flex h-11 w-11 items-center justify-center text-text-primary"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-lg font-extrabold text-text-primary">設定</span>
        <div className="w-11" />
      </header>

      <main className="flex-1 px-4 py-5">
        {user?.email && <div className="mb-6 text-sm text-text-secondary">{user.email}</div>}

        <section className="mb-8">
          <h2 className="mb-3 text-xs font-extrabold text-text-secondary">ベースカラー</h2>
          <div className="flex flex-wrap gap-3">
            {BASE_COLOR_THEMES.map((theme) => (
              <div key={theme.id} className="flex flex-col items-center gap-1">
                <ColorDot
                  color={theme.hex}
                  colorName={theme.name}
                  isSelected={settings.baseColor === theme.hex}
                  onClick={() => handleSelectColor(theme.hex)}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-3 text-xs font-extrabold text-text-secondary">管理</h2>
          <Link
            href="/settings/tags"
            className="flex min-h-touch items-center gap-2 rounded-md bg-bg-secondary px-3 text-sm font-semibold text-text-primary"
          >
            <TagIcon size={16} />
            <span className="flex-1">タグ管理</span>
            <ChevronRight size={16} className="text-text-tertiary" />
          </Link>
        </section>

        <section className="mb-8">
          <button
            type="button"
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="flex min-h-touch items-center gap-2 rounded-md bg-bg-secondary px-3 text-sm font-semibold text-error"
          >
            <LogOut size={16} />
            ログアウト
          </button>
        </section>

        <section>
          <button
            type="button"
            onClick={() => setIsDeleteSheetOpen(true)}
            className="flex min-h-touch items-center gap-2 px-3 text-xs font-semibold text-text-tertiary"
          >
            <UserX size={14} />
            アカウントを削除
          </button>
        </section>
      </main>

      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        title="ログアウトしますか？"
        message="このデバイスからログアウトします。"
        confirmLabel="ログアウト"
        isDangerous
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutConfirmOpen(false)}
      />

      <AccountDeleteSheet isOpen={isDeleteSheetOpen} onClose={() => setIsDeleteSheetOpen(false)} />
    </div>
  )
}

export default function SettingsPage() {
  return (
    <RequireAuth>
      <SettingsContent />
    </RequireAuth>
  )
}
