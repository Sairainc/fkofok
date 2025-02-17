'use client'

import React from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PaymentButton } from '@/components/PaymentButton'
import { useUser } from '@/hooks/useUser'

export default function WomenPayment() {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth')
        return
      }
      
      // 男性ユーザーが女性用ページにアクセスした場合
      if (user.gender === 'men') {
        router.push('/payment/men')
        return
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

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">女性会員プラン</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">スタンダードプラン</h2>
                <p className="text-gray-600 mt-2">厳選された男性会員とマッチング</p>
              </div>
              <div className="text-3xl font-bold">¥4,800</div>
            </div>
            
            <ul className="space-y-3">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                収入証明書確認済みの男性会員とマッチング
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                プライバシー保護
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                24時間のサポート
              </li>
            </ul>

            <PaymentButton 
              priceId={process.env.NEXT_PUBLIC_STRIPE_WOMEN_PRICE_ID!}
              _userId="test_user"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 