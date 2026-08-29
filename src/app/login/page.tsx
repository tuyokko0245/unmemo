'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import { FirebaseError } from 'firebase/app'
import { useAuth } from '@/hooks/useAuth'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleBusy, setIsGoogleBusy] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [isIosPwa] = useState(() => {
    if (typeof window === 'undefined') return false
    const ua = navigator.userAgent
    const isIos = /iPad|iPhone|iPod/.test(ua)
    const isStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true
    return isIos && isStandalone
  })

  useEffect(() => {
    if (!loading && user) {
      router.replace('/')
    }
  }, [loading, user, router])

  const handleGoogleLogin = async () => {
    if (isGoogleBusy) return
    setIsGoogleBusy(true)
    setError('')
    try {
      await signInWithGoogle()
    } catch (e: unknown) {
      const code = (e as FirebaseError).code
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        // ユーザーが自分で閉じた場合は何も表示しない
      } else if (code === 'auth/popup-blocked') {
        setError('ポップアップがブロックされています。ブラウザの設定でこのサイトのポップアップを許可してください')
      } else if (code === 'auth/operation-not-supported-in-this-environment') {
        setError('Googleログインにはブラウザが必要です。画面下の共有ボタン →「Safari で開く」をタップしてからログインしてください')
      } else {
        setError('Googleログインに失敗しました。もう一度お試しください')
      }
      setIsGoogleBusy(false)
    }
  }

  const handleEmailSubmit = async () => {
    setError('')
    setIsSubmitting(true)
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password)
      } else {
        await signInWithEmail(email, password)
      }
    } catch {
      setError(isSignUp ? '新規登録に失敗しました' : 'メールアドレスまたはパスワードが正しくありません')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading || user) return null

  return (
    <div className="flex min-h-dvh justify-center bg-gradient-to-b from-base-50 to-[#DFF5EA]">
      <div className="flex w-full max-w-sm flex-col px-6 pb-8 pt-16">
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-white text-3xl shadow-md">
            🌿
          </div>
          <div className="mt-3.5 text-[28px] font-extrabold text-base-500">ウンmemo</div>
          <div className="mt-1 text-sm text-text-secondary">とにかく素早くメモができる</div>
        </div>

        <div className="h-12" />

        {isIosPwa ? (
          <div className="rounded-md border border-base-200 bg-base-50 p-4 text-sm text-text-secondary leading-relaxed">
            <p className="font-bold text-base-700 mb-1">Googleアカウントでログインする場合</p>
            iPhoneのホーム画面アプリではGoogleログインをご利用いただけません。
            メールアドレスでのログイン・登録をご利用ください。
            （SafariブラウザからはGoogleログインが使えます）
          </div>
        ) : (
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleBusy}
            className="flex h-[52px] items-center justify-center gap-2.5 rounded-md border-[1.5px] border-base-200 bg-white text-sm font-bold text-[#3C3C3C] shadow-sm disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.62z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.97v2.33A9 9 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.97A9 9 0 0 0 0 9c0 1.45.35 2.83.97 4.03l2.98-2.33z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .97 4.97l2.98 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
            </svg>
            Googleでログイン
          </button>
        )}

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-base-500/25" />
          <span className="text-xs font-bold text-text-tertiary">OR</span>
          <div className="h-px flex-1 bg-base-500/25" />
        </div>

        <div className="flex flex-col gap-3.5">
          <Input value={email} onChange={setEmail} placeholder="メールアドレス" type="email" />
          <div className="relative">
            <Input
              value={password}
              onChange={setPassword}
              placeholder="パスワード"
              type={showPassword ? 'text' : 'password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label="パスワード表示切替"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && <div className="mt-3 text-xs text-error">{error}</div>}

        <div className="mt-5">
          <Button
            size="lg"
            fullWidth
            onClick={handleEmailSubmit}
            loading={isSubmitting}
            disabled={!email || !password}
          >
            {isSignUp ? '新規登録' : 'ログイン'}
          </Button>
        </div>

        <div className="mt-auto pt-8 text-center">
          <span className="text-[13px] text-text-secondary">
            {isSignUp ? 'すでにアカウントをお持ちの方？' : 'アカウントをお持ちでない方？'}
          </span>{' '}
          <button
            type="button"
            onClick={() => setIsSignUp((v) => !v)}
            className="text-[13px] font-bold text-base-500"
          >
            {isSignUp ? 'ログイン' : '新規登録'}
          </button>
        </div>
      </div>
    </div>
  )
}
