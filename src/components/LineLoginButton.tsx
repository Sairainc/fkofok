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
        console.log("[DEBUG] Initializing LIFF from LineLoginButton");

        await initializeLiff(); // ここでは `process.env.NEXT_PUBLIC_LIFF_ID` を渡さない
      } catch (error) {
        console.error('[ERROR] Initialization error in LineLoginButton:', error);
      }
    }

    initialize();
  }, []);

  const handleLogin = async () => {
    try {
      if (!liff.isLoggedIn()) {
        console.log("[DEBUG] User is not logged in, redirecting...");
        await liff.login();
      }

      console.log("[DEBUG] User logged in, redirecting to form...");
      router.push('/form');
    } catch (error) {
      console.error('[ERROR] Login error:', error);
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
