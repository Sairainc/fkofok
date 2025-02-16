import liff from '@line/liff';
import type { Profile } from '@liff/get-profile';

// **[修正] import の後にログを移動**
console.log('[DEBUG] liff.ts is loaded!');

// LIFF初期化の改善
export const initializeLiff = async (liffId?: string): Promise<void> => {
  console.log('[DEBUG] Starting LIFF initialization...');
  console.log('[DEBUG] Raw LIFF ID:', liffId);
  
  if (!liffId) {
    console.error('[ERROR] LIFF ID is missing or undefined');
    throw new Error('LIFF ID is required');
  }

  const trimmedLiffId = liffId.trim();
  console.log('[DEBUG] Trimmed LIFF ID:', trimmedLiffId);
  console.log('[DEBUG] Trimmed LIFF ID length:', trimmedLiffId.length);

  if (!trimmedLiffId) {
    console.error('[ERROR] LIFF ID is empty after trimming');
    throw new Error('Invalid LIFF ID');
  }

  try {
    if (!liff.ready) {
      console.log('[DEBUG] Initializing LIFF with ID:', trimmedLiffId);
      await liff.init({
        liffId: trimmedLiffId,
        withLoginOnExternalBrowser: true
      });
      console.log('[DEBUG] LIFF initialization successful');
    } else {
      console.log('[DEBUG] LIFF is already initialized');
    }
  } catch (error) {
    console.error('[ERROR] LIFF initialization failed:', error);
    if (error instanceof Error) {
      console.error('[ERROR] Details:', {
        message: error.message,
        stack: error.stack,
        liffId: trimmedLiffId
      });
    }
    throw new Error(`LIFF initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

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
