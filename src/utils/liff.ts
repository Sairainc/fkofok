import liff from '@line/liff';

console.log('[DEBUG] liff.ts is loaded!');

export const initializeLiff = async (liffId?: string): Promise<void> => {
  // **サーバーサイドで実行しないようにする**
  if (typeof window === 'undefined') {
    console.warn('[WARN] Skipping LIFF initialization: running on server-side.');
    return;
  }

  console.log('[DEBUG] Starting LIFF initialization...')
  console.log('[DEBUG] ENV LIFF ID:', liffId);

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
    if (!liff.getAccessToken()) {
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
    throw new Error(`LIFF initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// **Next.js のサーバーサイドでは実行しないようにする**
if (typeof window !== 'undefined') {
  const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID?.trim() || "2006882585-DMX89WMb";
  console.log("[DEBUG] Final LIFF ID from env:", LIFF_ID);

  initializeLiff(LIFF_ID).catch((err) => {
    console.error("[ERROR] Failed to initialize LIFF:", err);
  });
}
