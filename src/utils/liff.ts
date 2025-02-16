import liff from '@line/liff';

console.log('[DEBUG] liff.ts is loaded!');

export const initializeLiff = async (liffId?: string): Promise<void> => {
  console.log('[DEBUG] Starting LIFF initialization...');
  console.log('[DEBUG] Raw LIFF ID:', liffId);

  if (!liffId) {
    console.error('[ERROR] LIFF ID is missing or undefined');
    throw new Error('LIFF ID is required');
  }

  const trimmedLiffId = liffId.trim();
  console.log('[DEBUG] Trimmed LIFF ID:', trimmedLiffId);

  if (!trimmedLiffId) {
    console.error('[ERROR] LIFF ID is empty after trimming');
    throw new Error('Invalid LIFF ID');
  }

  try {
    console.log('[DEBUG] Checking if LIFF is already initialized...');
    
    if (!liff.isLoggedIn() && !liff.getAccessToken()) {  
      console.log('[DEBUG] Initializing LIFF with ID:', trimmedLiffId);
      await liff.init({
        liffId: trimmedLiffId,
        withLoginOnExternalBrowser: true
      });
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
const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || "2006882585-DMX89WMb";
console.log("[DEBUG] Final LIFF ID:", LIFF_ID);

// LIFFの初期化を実行
initializeLiff(LIFF_ID).catch((err) => {
  console.error("[ERROR] Failed to initialize LIFF:", err);
});
