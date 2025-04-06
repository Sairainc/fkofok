'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import liff from '@line/liff'

export default function Payment() {
  const { user, loading } = useUser({ skipMatchCheck: true })
  const router = useRouter()
  const searchParams = useSearchParams()
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID

  useEffect(() => {
    const initPayment = async () => {
      if (!loading) {
        if (!user) {
          // ログインしていない場合、LINEログインを実行
          await liff.login({ redirectUri: window.location.href })
          return
        }

        // ユーザーの性別に基づいて適切な支払いページにリダイレクト
        const paymentUrl = `https://liff.line.me/${liffId}/payment/${user.gender}`
        window.location.href = paymentUrl
      }
    }

    initPayment()
  }, [user, loading, liffId])

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