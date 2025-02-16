'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import liff from '@line/liff'
import type { Profile } from '@liff/get-profile'
import { MultiStepForm } from '@/components/MultiStepForm'
import { initializeLiff } from '@/utils/liff'

console.log('[DEBUG] Form page loaded');

export default function Form(): React.ReactNode {
  const router = useRouter();
  const [lineProfile, setLineProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('[DEBUG] Form page - Starting initialization');

        await initializeLiff(); // ここでは `liffId` を渡さない

        // ログイン状態を確認
        if (!liff.isLoggedIn()) {
          console.log('[DEBUG] User not logged in, redirecting to login');

          const redirectUrl = process.env.NEXT_PUBLIC_LIFF_REDIRECT_URL;
          if (!redirectUrl) {
            throw new Error('Redirect URL is not configured');
          }

          console.log('[DEBUG] Redirect URL:', redirectUrl.trim());
          liff.login({ redirectUri: redirectUrl.trim() });
          return;
        }

        // プロフィール取得
        const profile = await liff.getProfile();
        console.log('[DEBUG] Profile retrieved:', profile);
        setLineProfile(profile);

      } catch (error) {
        console.error('[ERROR] Form page initialization error:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>エラーが発生しました</p>
          <p className="text-sm">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            トップページに戻る
          </button>
        </div>
      </div>
    );
  }

  if (!lineProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>LINEログインが必要です</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
          >
            トップページに戻る
          </button>
        </div>
      </div>
    );
  }

  return <MultiStepForm lineId={lineProfile.userId} />;
}
