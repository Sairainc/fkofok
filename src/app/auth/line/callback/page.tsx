'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import liff from '@line/liff'
import { getLiffProfile } from '@/utils/liff'

export default function LineCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('\n=== LINE Login Callback Started ===')
        
        // LIFF IDの検証
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID
        if (!liffId) {
          console.error('LIFF ID is missing')
          throw new Error('LIFF ID is not configured')
        }
        console.log('LIFF ID:', liffId)
        
        // LIFF初期化
        if (!liff.ready) {
          try {
            console.log('Initializing LIFF...')
            await liff.init({
              liffId: liffId,
              withLoginOnExternalBrowser: true
            })
            console.log('LIFF initialization successful')
          } catch (initError) {
            console.error('LIFF initialization error:', initError)
            throw new Error('LIFF initialization failed')
          }
        }

        // ログイン状態の確認
        if (!liff.isLoggedIn()) {
          console.error('User is not logged in at callback')
          throw new Error('User is not logged in')
        }

        // プロフィール取得
        try {
          const profile = await getLiffProfile()
          if (!profile) {
            throw new Error('Failed to get LINE profile')
          }
          console.log('Profile retrieved successfully:', profile)

          // フォームページへリダイレクト
          router.push('/form')
        } catch (profileError) {
          console.error('Profile retrieval error:', profileError)
          throw new Error('Failed to get LINE profile')
        }

      } catch (error) {
        console.error('\n=== LINE Login Callback Error ===')
        console.error('Error details:', error)
        
        let errorMessage = 'ログインに失敗しました。'
        if (error instanceof Error) {
          if (error.message.includes('LIFF ID')) {
            errorMessage = 'LIFF IDの設定が正しくありません。'
          } else if (error.message.includes('initialization failed')) {
            errorMessage = 'LIFFの初期化に失敗しました。'
          } else if (error.message.includes('not logged in')) {
            errorMessage = 'LINEログインが完了していません。'
          } else if (error.message.includes('LINE profile')) {
            errorMessage = 'プロフィール情報の取得に失敗しました。'
          }
        }
        setError(`${errorMessage}\nもう一度お試しください。`)
      }
    }

    handleCallback()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-sm text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"
          >
            トップページに戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-sm text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4">ログイン処理中...</p>
      </div>
    </div>
  )
} 