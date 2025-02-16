'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import liff from '@line/liff'

export default function LineCallback() {
  const router = useRouter()
  const [_error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('\n=== LINE Login Callback Started ===')

        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) {
          console.error('[ERROR] LIFF ID is missing')
          throw new Error('LIFF ID is not configured')
        }
        console.log('[DEBUG] LIFF ID:', liffId)

        if (!liff.isLoggedIn() && !liff.getOS()) {
          console.log('[DEBUG] Initializing LIFF...')
          await liff.init({
            liffId: liffId.trim(),
            withLoginOnExternalBrowser: true
          })
          console.log('[DEBUG] LIFF initialization successful')
        } else {
          console.log('[DEBUG] LIFF is already initialized or user is logged in')
        }

        if (!liff.isLoggedIn()) {
          console.warn('[WARN] User is not logged in, redirecting to LINE login...')
          await liff.login()
          return
        }

        console.log('[DEBUG] Redirecting to form page.')
        router.push('/form')

      } catch (error) {
        console.error('\n=== LINE Login Callback Error ===', error)
        setError('ログインに失敗しました。もう一度お試しください。')
      }
    }

    handleCallback()
  }, [router])
}
