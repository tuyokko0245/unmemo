'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useAuth } from '@/hooks/useAuth'
import { useSnackbar } from '@/hooks/useSnackbar'

interface AccountDeleteSheetProps {
  isOpen: boolean
  onClose: () => void
}

export function AccountDeleteSheet({ isOpen, onClose }: AccountDeleteSheetProps) {
  const { user, deleteAccount, reauthenticateWithGoogle, reauthenticateWithPassword } = useAuth()
  const { showSnackbar } = useSnackbar()
  const router = useRouter()

  const [confirmText, setConfirmText] = useState('')
  const [showFinalConfirm, setShowFinalConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [reauthPassword, setReauthPassword] = useState('')
  const [needsPasswordReauth, setNeedsPasswordReauth] = useState(false)

  const isGoogleUser = user?.providerData[0]?.providerId === 'google.com'
  const canProceed = confirmText.trim() === user?.email

  const handleClose = () => {
    setConfirmText('')
    setShowFinalConfirm(false)
    setNeedsPasswordReauth(false)
    setReauthPassword('')
    onClose()
  }

  const runDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteAccount()
      showSnackbar({ message: 'アカウントを削除しました', variant: 'warning' })
      router.push('/login')
    } catch (error) {
      const code = (error as { code?: string })?.code
      if (code === 'auth/requires-recent-login') {
        if (isGoogleUser) {
          try {
            await reauthenticateWithGoogle()
            await runDelete()
          } catch {
            showSnackbar({ message: '再認証に失敗しました', variant: 'error' })
          }
        } else {
          setNeedsPasswordReauth(true)
        }
      } else {
        showSnackbar({ message: 'アカウント削除に失敗しました', variant: 'error' })
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handlePasswordReauthSubmit = async () => {
    setIsDeleting(true)
    try {
      await reauthenticateWithPassword(reauthPassword)
      setNeedsPasswordReauth(false)
      setReauthPassword('')
      await runDelete()
    } catch {
      showSnackbar({ message: 'パスワードが正しくありません', variant: 'error' })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={handleClose} title="アカウントを削除">
        {needsPasswordReauth ? (
          <div className="flex flex-col gap-4 pt-2">
            <p className="text-sm text-text-secondary">
              セキュリティのため、パスワードを再入力してください。
            </p>
            <Input
              value={reauthPassword}
              onChange={setReauthPassword}
              type="password"
              placeholder="パスワード"
              autoFocus
            />
            <Button
              variant="danger"
              fullWidth
              onClick={handlePasswordReauthSubmit}
              loading={isDeleting}
              disabled={!reauthPassword}
            >
              確認して削除を続行
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pt-2">
            <p className="text-sm text-text-secondary">
              アカウントを削除すると、すべてのメモ・フォルダ・タグ・TODO・設定が完全に削除されます。
              <br />
              <span className="font-bold text-error">この操作は取り消せません。</span>
            </p>
            <p className="text-xs text-text-tertiary">
              続けるには、登録メールアドレス（{user?.email}）を下の欄に入力してください。
            </p>
            <Input value={confirmText} onChange={setConfirmText} placeholder="メールアドレスを入力" autoFocus />
            <Button
              variant="danger"
              fullWidth
              disabled={!canProceed}
              onClick={() => setShowFinalConfirm(true)}
            >
              アカウントを削除する
            </Button>
          </div>
        )}
      </BottomSheet>

      <ConfirmDialog
        isOpen={showFinalConfirm}
        title="本当に削除しますか？"
        message="これが最後の確認です。アカウントとすべてのデータは完全に削除され、復元できません。"
        confirmLabel="完全に削除する"
        isDangerous
        onConfirm={async () => {
          setShowFinalConfirm(false)
          await runDelete()
        }}
        onCancel={() => setShowFinalConfirm(false)}
      />
    </>
  )
}
