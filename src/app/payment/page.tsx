'use client'

import { useEffect } from 'react'
import { useUser } from '@/hooks/useUser'

export default function Payment() {
  const { user, loading } = useUser({ skipMatchCheck: true })

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // ログインしていない場合は認証ページへ
        window.location.href = '/auth'
        return
      }

      // ユーザーの性別に基づいて適切な支払いページにリダイレクト
      const paymentPath = user.gender === 'men' ? '/payment/men' : '/payment/women'
      window.location.href = `${window.location.origin}${paymentPath}`
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>支払い処理を開始しています...</div>
    </div>
  )
} 