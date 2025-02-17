// src/components/CallToAction.tsx
'use client'

import { useRouter } from 'next/navigation'
import { liff } from '@line/liff'

export const CallToAction = () => {
  const router = useRouter()

  const handleClick = async (_gender: 'men' | 'women') => {
    try {
      // LIFFの初期化
      await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
      
      if (!liff.isLoggedIn()) {
        // ログインしていない場合はLINEログインを実行
        liff.login({ redirectUri: `${process.env.NEXT_PUBLIC_URL}/form?gender=${_gender}` })
      } else {
        // すでにログインしている場合は直接フォームページへ
        router.push(`/form?gender=${_gender}`)
      }
    } catch (error) {
      console.error('LIFF initialization error:', error)
      alert('エラーが発生しました。もう一度お試しください。')
    }
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <h2 className="text-3xl font-bold text-gray-900">
          今すぐ無料で始めましょう
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          プロフィールを登録して、理想のパートナーを見つけましょう
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleClick('men')}
            className="inline-block px-8 py-3 text-lg font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
          >
            プロフィールを登録する
          </button>
        </div>
      </div>
    </div>
  )
}
