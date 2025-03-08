// クライアント側でSquare Web SDKをロードする関数
export const getSquare = async () => {
  try {
    // 動的インポート
    return await import('@square/web-sdk');
  } catch (error) {
    console.error('Failed to load Square Web SDK:', error);
    throw error;
  }
} 