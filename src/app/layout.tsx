import type { Metadata, Viewport } from 'next'
import { M_PLUS_Rounded_1c } from 'next/font/google'
import { AuthProvider } from '@/hooks/useAuth'
import { SnackbarProvider } from '@/hooks/useSnackbar'
import { ThemeApplier } from '@/components/layout/ThemeApplier'
import './globals.css'

const fontBase = M_PLUS_Rounded_1c({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mplus',
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL('https://unmemo-ten.vercel.app'),
  title: 'ウンmemo',
  description: 'とにかく素早くメモができる',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  openGraph: {
    title: 'ウンmemo',
    description: 'とにかく素早くメモができる',
    url: 'https://unmemo-ten.vercel.app',
    siteName: 'ウンmemo',
    images: [{ url: '/ogp.png', width: 1200, height: 630 }],
    locale: 'ja_JP',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ウンmemo',
    description: 'とにかく素早くメモができる',
    images: ['/ogp.png'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ウンmemo',
    startupImage: [
      {
        url: '/splash.png',
        media: '(device-width: 390px) and (device-height: 844px)',
      },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2AAF82',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={fontBase.variable}>
      <body>
        <AuthProvider>
          <SnackbarProvider>
            <ThemeApplier />
            {children}
          </SnackbarProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
