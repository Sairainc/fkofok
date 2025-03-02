import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/app/globals.css'
import { testSupabaseConnection } from '@/lib/supabase'
import { GeistSans } from 'geist/font/sans'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'コンパる',
  description: 'コンパるは、合コンマッチングサービスです。',
  keywords: 'マッチング,婚活,恋活,出会い,安心,安全',
  icons: {
    icon: '/images/iconfav.png',
    apple: '/images/iconfav.png',
  },
  openGraph: {
    title: 'マッチングサービス | 安心・安全な出会いを',
    description: '厳選されたマッチングサービス。プロフィール審査済みの会員同士で、安心・安全な出会いを提供します。',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // アプリケーション起動時にSupabase接続をテスト
  if (typeof window !== 'undefined') {
    testSupabaseConnection().then(isConnected => {
      if (!isConnected) {
        console.error('Failed to connect to Supabase')
      }
    })
  }

  return (
    <html lang="ja" className={`${inter.className} antialiased ${GeistSans.className}`}>
      <body>{children}</body>
    </html>
  )
} 