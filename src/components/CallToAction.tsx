'use client'

import React from 'react'
import Image from 'next/image'
import liff from '@line/liff'

type CallToActionProps = {
  userType: 'men' | 'women'
}

export const CallToAction = ({ userType }: CallToActionProps) => {
  const LINE_URL = process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL!
  const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || "2006882585-DMX89WMb"; // デフォルト値を設定
  const REDIRECT_URL = process.env.NEXT_PUBLIC_LIFF_REDIRECT_URL || 'https://gogochdlfbd.com/auth/line/callback'

  // URLが有効かを確認する関数
  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleLineClick = () => {
    window.open(LINE_URL, '_blank')
  }

  const handleRegisterClick = async () => {
    try {
      console.log('\n=== LINE Login Process Started from CallToAction ===')
      
      // LIFF IDの検証
      if (!LIFF_ID) {
        console.error('[ERROR] LIFF ID is missing:', LIFF_ID)
        throw new Error('LIFF ID is not configured')
      }
      console.log('[DEBUG] LIFF ID:', LIFF_ID)

      // リダイレクトURLの検証
      if (!REDIRECT_URL || !isValidUrl(REDIRECT_URL)) {
        console.error('[ERROR] Invalid redirect URL:', REDIRECT_URL)
        throw new Error('Redirect URL is not properly configured')
      }
      console.log('[DEBUG] Redirect URL:', REDIRECT_URL)

      // LIFF初期化の前にIDをログ出力
      const trimmedLiffId = LIFF_ID.trim()
      console.log('[DEBUG] LIFF ID before init:', trimmedLiffId)

      try {
        // すでにLIFFが初期化されているか確認
        if (!liff.getAccessToken()) { 
          console.log('[DEBUG] Initializing LIFF...')
          if (!trimmedLiffId) {
            throw new Error('LIFF ID is empty after trimming')
          }

          // LIFF初期化
          await liff.init({
            liffId: trimmedLiffId,
            withLoginOnExternalBrowser: true
          })
          console.log('[DEBUG] LIFF initialization successful')
        } else {
          console.log('[DEBUG] LIFF is already initialized')
        }

        // ログイン処理
        if (!liff.isLoggedIn()) {
          console.log('[DEBUG] User not logged in, starting login process')
          const trimmedRedirectUrl = REDIRECT_URL.trim()
          console.log('[DEBUG] Redirect URL after trim:', trimmedRedirectUrl)

          // ログイン処理を実行
          liff.login({
            redirectUri: trimmedRedirectUrl
          })
        } else {
          console.log('[DEBUG] User already logged in, redirecting...')
          window.location.href = REDIRECT_URL.trim()
        }
      } catch (error) {
        console.error('[ERROR] LIFF initialization/login error:', error)
        throw new Error('LIFF initialization failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
      }
      
    } catch (error) {
      console.error('\n=== LINE Login Error in CallToAction ===')
      console.error('[ERROR] Details:', error)

      let errorMessage = 'LINEログインに失敗しました。'
      if (error instanceof Error) {
        if (error.message.includes('LIFF ID')) {
          errorMessage = 'LIFF IDの設定が正しくありません。'
        } else if (error.message.includes('initialization failed')) {
          errorMessage = 'LIFFの初期化に失敗しました。'
        } else if (error.message.includes('Redirect URL')) {
          errorMessage = 'リダイレクトURLの設定が正しくありません。'
        }
      }
      alert(`${errorMessage}\nもう一度お試しください。`)
    }
  }

  return (
    <div className="sticky bottom-0 w-full z-50 group">
      <div className="fixed inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      <div className="relative bg-[#B8860B] transform translate-y-[calc(100%-60px)] group-hover:translate-y-0 transition-transform duration-300">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#B8860B] text-white px-6 py-2 rounded-t-lg flex items-center gap-2">
          <Image
            src="/line-icon.png"
            alt="LINE"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          <span className="font-bold">今すぐ登録</span>
        </div>
        <div className="p-6 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            {userType === 'men' ? '理想の出会いを見つけよう' : '素敵な出会いを見つけよう'}
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <button
              onClick={handleLineClick}
              className="flex-1 bg-[#00B900] hover:bg-[#009900] text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Image
                src="/line-icon.png"
                alt="LINE"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              LINE友だち追加
            </button>
            
            <button
              onClick={handleRegisterClick}
              className="flex-1 bg-white hover:bg-gray-100 text-[#B8860B] font-bold py-3 px-6 rounded-lg transition-colors"
            >
              プロフィール登録
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
