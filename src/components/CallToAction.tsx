'use client'

import React from 'react'
import liff from '@line/liff'

export const CallToAction = ({ userType: _userType }: { userType: 'men' | 'women' }) => {
  const LINE_URL = process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL!
  const REDIRECT_URL = (process.env.NEXT_PUBLIC_LIFF_REDIRECT_URL || 'https://gogochdlfbd.com/auth/line/callback').trim();

  const handleRegisterClick = async () => {
    try {
      console.log('\n=== LINE Login Process Started from CallToAction ===')

      if (!liff.isLoggedIn()) {
        console.log('[DEBUG] User not logged in, starting login process')
        liff.login({ redirectUri: REDIRECT_URL })
      } else {
        console.log('[DEBUG] User already logged in, redirecting...')
        window.location.href = REDIRECT_URL
      }
    } catch (error) {
      console.error('[ERROR] LIFF login error:', error)
      alert('LINEログインに失敗しました。もう一度お試しください。')
    }
  }

  return (
    <div className="flex justify-center items-center py-4">
      <button 
        onClick={handleRegisterClick} 
        className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        プロフィール登録
      </button>
    </div>
  )
}
