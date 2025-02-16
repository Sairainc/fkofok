// src/components/CallToAction.tsx
'use client'

import { useEffect, useState } from 'react'
import liff from '@line/liff'
import { initializeLiff } from '@/utils/liff'

export const CallToAction = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // クライアントサイドでのみ実行
    if (typeof window === 'undefined') {
      return;
    }

    const init = async () => {
      try {
        console.log('[DEBUG] Start LIFF initialization from CallToAction');
        // 環境変数から LIFF ID を取得
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) {
          console.error('[ERROR] NEXT_PUBLIC_LIFF_ID is missing');
          return;
        }
        // LIFF 初期化
        await initializeLiff(liffId);
        setInitialized(true);
      } catch (error) {
        console.error('[ERROR] initializeLiff error:', error);
      }
    };

    init();
  }, []);

  const handleRegisterClick = async () => {
    try {
      console.log('\n=== LINE Login Process Started from CallToAction ===');

      // 初期化されていなければ処理を中断
      if (!initialized) {
        console.error('[ERROR] LIFF is not initialized yet');
        alert('LIFFの初期化が完了していません。もう一度お試しください。');
        return;
      }

      // 未ログインの場合のみログインを実行
      if (!liff.isLoggedIn()) {
        console.log('[DEBUG] User not logged in, starting login process');
        const redirectUri = process.env.NEXT_PUBLIC_LIFF_REDIRECT_URL || 'https://example.com/callback';
        liff.login({ redirectUri });
      } else {
        console.log('[DEBUG] User already logged in, redirecting...');
        window.location.href = process.env.NEXT_PUBLIC_LIFF_REDIRECT_URL || 'https://example.com/callback';
      }
    } catch (error) {
      console.error('[ERROR] LIFF login error:', error);
      alert('LINEログインに失敗しました。もう一度お試しください。');
    }
  };

  return (
    <button onClick={handleRegisterClick}>
      プロフィール登録
    </button>
  );
};
