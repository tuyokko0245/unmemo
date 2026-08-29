import type { NextConfig } from 'next'
import withPWAInit from '@ducanh2912/next-pwa'

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  reloadOnOnline: false,
  fallbacks: {
    document: '/offline',
  },
  workboxOptions: {
    skipWaiting: true,
    clientsClaim: true,
    navigateFallbackDenylist: [/^\/__\//],
    runtimeCaching: [
      {
        urlPattern: /^\/__\//,
        handler: 'NetworkOnly' as const,
      },
      {
        urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
        handler: 'NetworkFirst' as const,
        options: {
          networkTimeoutSeconds: 10,
          cacheName: 'pages',
        },
      },
    ],
  },
})

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/__/auth/:path*',
        destination: 'https://unmemo-app.firebaseapp.com/__/auth/:path*',
      },
      {
        source: '/__/firebase/:path*',
        destination: 'https://unmemo-app.firebaseapp.com/__/firebase/:path*',
      },
    ]
  },
}

export default withPWA(nextConfig)
