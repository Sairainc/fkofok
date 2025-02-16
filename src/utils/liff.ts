import liff from '@line/liff';
import type { Profile } from '@liff/get-profile';

// **[修正] import の後にログを移動**
console.log('[DEBUG] liff.ts is loaded!');

// LIFF初期化
export const initializeLiff = async (liffId?: string) => {
  if (!liffId) {
    console.error('LIFF ID is missing:', liffId)
    throw new Error('LIFF ID is required')
  }
  
  try {
    console.log('Initializing LIFF with ID:', liffId)
    await liff.init({
      liffId: liffId,
      withLoginOnExternalBrowser: true
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
