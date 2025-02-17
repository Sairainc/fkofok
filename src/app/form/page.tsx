'use client'

import dynamic from 'next/dynamic'
import { Suspense, useEffect, useState } from 'react'
import { liff } from '@line/liff'
import { useRouter } from 'next/navigation'

const DynamicMultiStepForm = dynamic(() => import('@/components/MultiStepForm'), {
  ssr: false,
  loading: () => <div>Loading...</div>
})

export default function Form() {
  const [lineId, setLineId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const initializeLiff = async () => {
      try {
        console.log("🔍 LIFF ID:", process.env.NEXT_PUBLIC_LIFF_ID)

        // LIFF SDKの初期化
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
        await liff.ready

        // 未ログインの場合、LINEログイン画面にリダイレクト
        if (!liff.isLoggedIn()) {
          console.log("🔄 User is not logged in, redirecting to LINE login...")
          liff.login()
          return
        }

        // IDトークンの取得
        const idToken = liff.getIDToken()
        console.log("🚀 ID Token:", idToken)

        if (!idToken) {
          throw new Error('IDトークンを取得できませんでした')
        }

        // サーバーサイドでIDトークンを検証
        const response = await fetch('/api/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        })

        if (!response.ok) {
          throw new Error(`トークン検証に失敗しました (ステータス: ${response.status})`)
        }

        const { userId } = await response.json()
        console.log("✅ LINE User ID:", userId)
        setLineId(userId)

      } catch (err) {
        console.error('❌ LIFF initialization error:', err)
        setError(`LINEログインに失敗しました: ${err}`)
        router.push('/')
      }
    }

    initializeLiff()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            トップページに戻る
          </button>
        </div>
      </div>
    )
  }

  if (!lineId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DynamicMultiStepForm lineId={lineId} />
    </Suspense>
  )
}
