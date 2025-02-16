import liff from '@line/liff';
import type { Profile } from '@liff/get-profile';
import { supabase } from '@/lib/supabase'; // 既存のSupabaseクライアントを使用

// **[修正] import の後にログを移動**
console.log('[DEBUG] liff.ts is loaded!');

interface LogDetails {
  [key: string]: unknown;
}

// **ログ送信用のヘルパー関数**
const sendLog = async (event: string, details: LogDetails) => {
  try {
    console.log(`\n=== ${event} ===`)
    console.log('Details:', details)
    await fetch('/api/line-login-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, details }),
    });
  } catch (error) {
    console.error('[ERROR] Error sending log:', error);
  }
};

// LIFF初期化
export const initializeLiff = async (liffId?: string) => {
  if (!liffId) {
    throw new Error('LIFF ID is required')
  }
  
  try {
    await liff.init({
      liffId: liffId
    })
    console.log('LIFF initialization succeeded')
  } catch (error) {
    console.error('LIFF initialization failed:', error)
    throw error
  }
}

// **ログインしているユーザーのプロフィール情報を取得**
export const getLiffProfile = async (): Promise<Profile | null> => {
  if (!liff.isLoggedIn()) {
    throw new Error('User is not logged in')
  }

  try {
    const profile = await liff.getProfile()
    console.log('LINE Profile:', profile)
    return profile
  } catch (error) {
    console.error('Error getting LINE profile:', error)
    throw error
  }
}

// ログイン処理
export const login = async () => {
  const redirectUrl = process.env.NEXT_PUBLIC_LIFF_REDIRECT_URL
  if (!redirectUrl) {
    throw new Error('Redirect URL is not configured')
  }

  liff.login({
    redirectUri: redirectUrl
  })
}
