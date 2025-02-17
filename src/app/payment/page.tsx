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
      } else {
        // 一時的に全てのユーザーを男性用ページにリダイレクト
        router.push('/payment/men')
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