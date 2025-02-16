import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { testSupabaseConnection } from '@/lib/supabase'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'マッチングサービス | 安心・安全な出会いを',
  description: '厳選されたマッチングサービス。プロフィール審査済みの会員同士で、安心・安全な出会いを提供します。',
  keywords: 'マッチング,婚活,恋活,出会い,安心,安全',
  openGraph: {
    title: 'マッチングサービス | 安心・安全な出会いを',
    description: '厳選されたマッチングサービス。プロフィール審査済みの会員同士で、安心・安全な出会いを提供します。',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // アプリケーション起動時にSupabase接続をテスト
  if (typeof window !== 'undefined') {
    testSupabaseConnection().then(isConnected => {
      if (!isConnected) {
        console.error('Failed to connect to Supabase')
      }
    })
  }

  return (
    <html lang="ja">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
} 