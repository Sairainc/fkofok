'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'

export default function Payment() {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // ユーザーがログインしていない場合は認証ページへ
        router.push('/auth')
        return
      }

      // ユーザーの性別に応じて適切な決済ページへリダイレクト
      if (user.gender === 'men') {
        router.push('/payment/men')
      } else if (user.gender === 'women') {
        router.push('/payment/women')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // ローディング中やリダイレクト中の表示
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>リダイレクト中...</div>
    </div>
  )
} 