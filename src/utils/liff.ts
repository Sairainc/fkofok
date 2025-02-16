// src/utils/liff.ts
import liff from '@line/liff';

console.log('[DEBUG] liff.ts is loaded!');

/**
 * LIFF を初期化する関数
 * @param liffId - 環境変数から取得する LIFF ID
 */
export const initializeLiff = async (liffId?: string): Promise<void> => {
  // サーバーサイド（SSR）では window がないのでスキップ
  if (typeof window === 'undefined') {
    console.warn('[WARN] Skipping LIFF initialization: running on server-side.');
    return;
  }

  // LIFF ID がない場合はエラー
  if (!liffId) {
    throw new Error('LIFF ID is required but missing.');
  }

  // すでに初期化済みならスキップ
  if (liff.getAccessToken()) {
    console.log('[DEBUG] LIFF is already initialized');
    return;
  }

  console.log('[DEBUG] Initializing LIFF with ID:', liffId);
  await liff.init({
    liffId
    // withLoginOnExternalBrowser: true  // 必要に応じて
  });
  console.log('[DEBUG] LIFF initialization successful');
};
