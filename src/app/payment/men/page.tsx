'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'

export default function MenPayment() {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">男性会員プラン</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">プレミアムプラン</h2>
                <p className="text-gray-600 mt-2">厳選された女性会員とマッチング</p>
              </div>
              <div className="text-3xl font-bold">¥4,980</div>
            </div>
            
            <ul className="space-y-3">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                プロフィール審査済みの女性会員とマッチング
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                優先的なマッチング
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                24時間のサポート
              </li>
            </ul>

            <ul className="list-disc pl-5 mb-4">
              <li>すべての機能にアクセス可能</li>
              <li>プレミアムサポート</li>
              <li>新機能優先アクセス</li>
            </ul>

            <a
              href="https://square.link/u/6bklVkRk"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              支払いに進む
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 