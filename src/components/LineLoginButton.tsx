'use client'

import { useEffect } from 'react'
import { initializeLiff } from '@/utils/liff'
import liff from '@line/liff'
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
      await liff.login()
      router.push('/form')
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