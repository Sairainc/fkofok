'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import liff from '@line/liff'
import type { Profile } from '@liff/get-profile'
import { MultiStepForm } from '@/components/MultiStepForm'

// デバッグ用のログを追加
console.log('Form page loaded')

export default function Form(): React.ReactNode {
  const router = useRouter()
  const [lineProfile, setLineProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('[DEBUG] Form page - Starting initialization')
        
        // LIFF初期化
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID
        if (!liffId) {
          throw new Error('LIFF ID is not configured')
        }
        
        if (!liff.ready) {
          await liff.init({ liffId })
        }

        // ログイン状態を確認
        if (!liff.isLoggedIn()) {
          console.log('[DEBUG] User not logged in, redirecting to login')
          const redirectUrl = process.env.NEXT_PUBLIC_LIFF_REDIRECT_URL
          if (!redirectUrl) {
            throw new Error('Redirect URL is not configured')
          }
          await liff.login({ redirectUri: redirectUrl })
          return
        }

        // プロフィール取得
        const profile = await liff.getProfile()
        console.log('[DEBUG] Profile retrieved:', profile)
        setLineProfile(profile)

        // ログ送信
        await fetch('/api/line-login-log', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'FORM_PAGE_PROFILE_FETCH',
            details: {
              userId: profile.userId,
              displayName: profile.displayName
            }
          })
        })

      } catch (error) {
        console.error('[ERROR] Form page initialization error:', error)
        setError(error instanceof Error ? error.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>エラーが発生しました</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            トップページに戻る
          </button>
        </div>
      </div>
    )
  }

  if (!lineProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>LINEログインが必要です</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            トップページに戻る
          </button>
        </div>
      </div>
    )
  }

  return <MultiStepForm lineId={lineProfile.userId} />
} 