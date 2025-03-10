'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'

export default function WomenPayment() {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && user.gender !== 'women') {
      router.push('/payment/men')
    }
  }, [user, loading, router])

  if (loading) {
    return <div className="text-center py-10">Loading...</div>
  }

  if (!user) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-4">ログインが必要です</h2>
        <p>このページを表示するにはログインしてください。</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">女性会員プラン</h1>
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-center mb-6">女性プラン</h2>
              <div className="text-center mb-6">
                <span className="text-4xl font-bold">¥3,000</span>
                <span className="text-gray-600">/月</span>
              </div>
              
              <p className="text-gray-700 mb-6">
                女性向けプランでは以下の特典が含まれています：
              </p>
              
              <ul className="list-disc pl-5 mb-4">
                <li>すべての機能にアクセス可能</li>
                <li>プレミアムサポート</li>
                <li>新機能優先アクセス</li>
              </ul>

              {/* 直接URLをハードコード */}
              <a
                href="https://square.link/u/jeoxIt7N"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-center"
              >
                支払いに進む
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 