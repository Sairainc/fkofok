import React from 'react'
import liff from '@line/liff'

export const CallToAction = ({ userType }: { userType: 'men' | 'women' }) => {
  const LINE_URL = process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL!
  const REDIRECT_URL = process.env.NEXT_PUBLIC_LIFF_REDIRECT_URL || 'https://gogochdlfbd.com/auth/line/callback'

  const _handleLineClick = () => {
    window.open(LINE_URL, '_blank');
  };

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
    <button onClick={handleRegisterClick}>
      プロフィール登録
    </button>
  )
}
