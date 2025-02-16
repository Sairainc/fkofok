// src/components/CallToAction.tsx
'use client'

import { liff } from '@line/liff'
import { useEffect, useState } from 'react'

export const CallToAction = () => {
  const [isLiffInitialized, setIsLiffInitialized] = useState(false)

  useEffect(() => {
    // LIFFの初期化
    const initLiff = async () => {
      try {
        await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID! })
        setIsLiffInitialized(true)
      } catch (error) {
        console.error('LIFF initialization failed:', error)
      }
    }

    initLiff()
  }, [])

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!isLiffInitialized) {
      console.error('LIFF is not initialized')
      return
    }

    try {
      if (!liff.isLoggedIn()) {
        liff.login({ redirectUri: `${process.env.NEXT_PUBLIC_URL}/form` })
      } else {
        window.location.href = '/form'
      }
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <button
          onClick={handleClick}
          className="inline-block px-8 py-3 text-lg font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
        >
          プロフィール登録
        </button>
      </div>
    </div>
  )
}
