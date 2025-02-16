'use client'

import { useEffect } from 'react'
import { initializeLiff, login } from '@/utils/liff'
import { Button } from './Button'
import { useRouter } from 'next/navigation'

export const LineLoginButton = () => {
  const router = useRouter()

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeLiff(process.env.NEXT_PUBLIC_LIFF_ID!)
      } catch (error) {
        console.error('Initialization error:', error)
      }
    }
    initialize()
  }, [])

  const handleLogin = async () => {
    try {
      // login 関数を使用してLINEログインとプロフィール取得を行う
      await login()
      // ログイン成功後にsignupページに遷移
      router.push('/signup')
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <Button
      onClick={handleLogin}
      className="bg-green-500 hover:bg-green-600"
    >
      LINEでログイン
    </Button>
  )
} 