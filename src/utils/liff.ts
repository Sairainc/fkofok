import liff from '@line/liff';

console.log('[DEBUG] liff.ts is loaded!');

export const initializeLiff = async (): Promise<void> => {
  console.log('[DEBUG] Starting LIFF initialization...');

  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  console.log('[DEBUG] ENV LIFF ID:', liffId);

  if (!liffId) {
    console.error('[ERROR] LIFF ID is undefined in environment variables');
    throw new Error('LIFF ID is required but missing');
  }

  const trimmedLiffId = liffId.trim();
  console.log('[DEBUG] Trimmed LIFF ID:', trimmedLiffId);

  if (!trimmedLiffId) {
    console.error('[ERROR] Trimmed LIFF ID is empty');
    throw new Error('Invalid LIFF ID');
  }

  try {
    console.log('[DEBUG] Checking if LIFF is already initialized...');
    
    if (!liff.isLoggedIn() && !liff.getOS()) {
      console.log('[DEBUG] Initializing LIFF with ID:', trimmedLiffId);
      await liff.init({ liffId: trimmedLiffId, withLoginOnExternalBrowser: true });
      console.log('[DEBUG] LIFF initialization successful');
    } else {
      console.log('[DEBUG] LIFF is already initialized or user is logged in');
    }
  } catch (error) {
    console.error('[ERROR] LIFF initialization failed:', error);
    throw new Error(`LIFF initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// 環境変数の取得とデバッグログ
console.log("[DEBUG] Final LIFF ID from env:", process.env.NEXT_PUBLIC_LIFF_ID);
if (!process.env.NEXT_PUBLIC_LIFF_ID) {
  console.error("[ERROR] LIFF ID is missing in environment variables");
}

// LIFFの初期化を実行
initializeLiff().catch((err) => {
  console.error("[ERROR] Failed to initialize LIFF:", err);
});
