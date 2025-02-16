'use client'

import { useEffect, useState } from 'react'
import { LineLoginButton } from '@/components/LineLoginButton'
import { initializeLiff } from '@/utils/liff'
import liff from '@line/liff'
import type { Profile } from '@liff/get-profile'

export default function TestLine() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeLiff(process.env.NEXT_PUBLIC_LIFF_ID!)
        
        if (liff.isLoggedIn()) {
          const userProfile = await liff.getProfile()
          console.log('LINE Profile retrieved:', userProfile)
          setProfile(userProfile)
          
          // プロフィール情報をサーバーに送信してログ出力
          await fetch('/api/log-profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userProfile),
          })
        }
      } catch (error) {
        console.error('Initialization error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    initialize()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">LINE Login Test</h1>
      <LineLoginButton />
      
      {profile && (
        <div className="mt-4">
          <h2 className="text-xl mb-2">プロフィール情報:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 