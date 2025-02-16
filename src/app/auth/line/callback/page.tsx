'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import liff from '@line/liff'

// プロフィールを取得する関数を定義（エクスポートされていない場合）
const getLiffProfile = async () => {
  try {
    if (!liff.isLoggedIn()) {
      throw new Error('User is not logged in')
    }
    return await liff.getProfile()
  } catch (error) {
    console.error('[ERROR] Failed to get LINE profile:', error)
    return null
  }
}

export default function LineCallback() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('\n=== LINE Login Callback Started ===')

        // LIFF IDの取得
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID
        if (!liffId) {
          console.error('[ERROR] LIFF ID is missing')
          throw new Error('LIFF ID is not configured')
        }
        console.log('[DEBUG] LIFF ID:', liffId)

        // LIFF の初期化チェック（`liff.isInitialized()` はないため、代わりに `liff.init()` をtry-catch）
        try {
          if (!liff.getAccessToken()) { // 代替のチェック
            console.log('[DEBUG] Initializing LIFF...')
            await liff.init({
              liffId: liffId.trim(),
              withLoginOnExternalBrowser: true
            })
            console.log('[DEBUG] LIFF initialization successful')
          } else {
            console.log('[DEBUG] LIFF is already initialized')
          }
        } catch (initError) {
          console.error('[ERROR] LIFF initialization failed:', initError)
          throw new Error('LIFF initialization failed')
        }

        // ログイン状態を確認
        if (!liff.isLoggedIn()) {
          console.warn('[WARN] User is not logged in, redirecting to LINE login...')
          await liff.login()
          return // `liff.login()` が実行された場合、処理を中断
        }

        // プロフィール取得
        const profile = await getLiffProfile()
        if (!profile) {
          throw new Error('Failed to get LINE profile')
        }
        console.log('[DEBUG] Profile retrieved successfully:', profile)

        // LINEアプリ内で開いている場合はウィンドウを閉じる
        if (liff.isInClient()) {
          console.log('[DEBUG] Running inside LINE app, closing window.')
          liff.closeWindow()
        } else {
          console.log('[DEBUG] Redirecting to form page.')
          router.push('/form')
        }

      } catch (error) {
        console.error('\n=== LINE Login Callback Error ===')
        console.error('[ERROR] Details:', error)

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
