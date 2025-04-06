'use client'

import { useEffect } from 'react'
import { useUser } from '@/hooks/useUser'

export default function WomenPayment() {
  const { user, loading } = useUser({ skipMatchCheck: true })

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // ログインしていない場合は認証ページへ
        window.location.href = '/auth'
        return
      }

      if (user.gender !== 'women') {
        // 男性ユーザーの場合は男性用ページへ
        window.location.href = '/payment/men'
        return
      }

      // Squareの支払いページにリダイレクト
      const paymentUrl = process.env.NEXT_PUBLIC_SQUARE_WOMEN_PAYMENT_LINK
      if (paymentUrl) {
        window.location.href = paymentUrl
      }
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