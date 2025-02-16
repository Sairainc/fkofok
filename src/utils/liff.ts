import liff from '@line/liff';
import type { Profile } from '@liff/get-profile';
import { supabase } from '@/lib/supabase'; // 既存のSupabaseクライアントを使用

// **[修正] import の後にログを移動**
console.log('[DEBUG] liff.ts is loaded!');

// **ログ送信用のヘルパー関数**
const sendLog = async (event: string, details: any) => {
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

// 初期化状態を追跡
let isInitialized = false

export const initializeLiff = async () => {
  try {
    console.log('[DEBUG] Starting LIFF initialization...')
    console.log('[DEBUG] LIFF ID:', process.env.NEXT_PUBLIC_LIFF_ID)
    
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID
    if (!liffId) {
      throw new Error('LIFF ID is not configured')
    }

    if (!isInitialized) {
      await liff.init({ liffId })
      isInitialized = true
      console.log('[DEBUG] LIFF initialization successful')
    }

    return true
  } catch (error) {
    console.error('[ERROR] LIFF initialization failed:', error)
    throw error
  }
}

// **ログインしているユーザーのプロフィール情報を取得**
export const getLiffProfile = async (): Promise<Profile | null> => {
  try {
    console.log('[DEBUG] Fetching profile...');
    await sendLog('LIFF_PROFILE_CHECK_START', {});

    if (!liff.isLoggedIn()) {
      console.warn('[DEBUG] User is not logged in');
      await sendLog('LIFF_NOT_LOGGED_IN', {});
      return null;
    }

    // プロフィール取得を試みる前にログを出力
    console.log('[DEBUG] Getting profile...');
    const profile = await liff.getProfile();
    console.log('[DEBUG] Profile retrieved:', profile);

    const idToken = liff.getIDToken();
    if (!idToken) {
      console.warn('[DEBUG] ID Token is missing');
      await sendLog('LIFF_IDTOKEN_MISSING', {});
      return profile; // IDトークンがなくてもプロフィールは返す
    }

    // Supabaseにユーザー情報を保存
    try {
      const saveData = {
        line_id: profile.userId,
        display_name: profile.displayName,
        profile_picture: profile.pictureUrl,
        updated_at: new Date().toISOString()
      }

      console.log('[DEBUG] Attempting to save to Supabase:', saveData)
      await sendLog('SUPABASE_SAVE_START', saveData)

      const { data, error } = await supabase
        .from('profiles')
        .upsert([saveData], {
          onConflict: 'line_id'
        })

      if (error) {
        console.error('[ERROR] Supabase save failed:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        })
        await sendLog('SUPABASE_SAVE_ERROR', {
          error: error,
          data: saveData
        })
      } else {
        console.log('[DEBUG] User saved to Supabase successfully')
        await sendLog('SUPABASE_SAVE_SUCCESS', { data: saveData })
      }
    } catch (dbError) {
      console.error('[ERROR] Database operation failed:', dbError)
      await sendLog('SUPABASE_SAVE_ERROR', {
        error: dbError instanceof Error ? {
          message: dbError.message,
          name: dbError.name,
          stack: dbError.stack
        } : 'Unknown error',
        data: {
          line_id: profile.userId,
          display_name: profile.displayName
        }
      })
    }

    await sendLog('LIFF_PROFILE_FETCH_SUCCESS', {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage
    });

    return profile;
  } catch (error) {
    console.error('[ERROR] Profile fetch error:', error);
    await sendLog('LIFF_PROFILE_ERROR', {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : 'Unknown error'
    });
    throw error; // エラーを上位に伝播させる
  }
};

// **IDトークンをサーバーに送信して検証**
const sendIdTokenToServer = async (idToken: string | null) => {
  if (!idToken) {
    console.warn('[DEBUG] No ID token found');
    return;
  }

  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    const result = await response.json();
    if (response.ok) {
      console.log('[DEBUG] ID token verified successfully:', result);
    } else {
      console.warn('[DEBUG] ID token verification failed:', result);
    }
  } catch (error) {
    console.error('[ERROR] Error sending ID token:', error);
  }
};

// **ログイン処理**
export const login = async () => {
  const redirectUrl = process.env.NEXT_PUBLIC_LIFF_REDIRECT_URL
  if (!redirectUrl) {
    throw new Error('Redirect URL is not configured')
  }

  liff.login({
    redirectUri: redirectUrl
  })
}
