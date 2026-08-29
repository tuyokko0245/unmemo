import type { Metadata } from 'next'
import { WifiOff } from 'lucide-react'
import { OfflineRetryButton } from '@/components/features/OfflineRetryButton'

export const metadata: Metadata = {
  title: 'オフライン - ウンmemo',
}

export default function OfflinePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-base-50 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-white shadow-md">
        <WifiOff size={28} className="text-base-500" />
      </div>
      <div>
        <div className="text-lg font-extrabold text-base-700">オフラインです</div>
        <p className="mt-2 text-sm text-text-secondary">
          インターネットに接続されていません。
          <br />
          接続を確認してからもう一度お試しください。
        </p>
      </div>
      <OfflineRetryButton />
    </div>
  )
}
