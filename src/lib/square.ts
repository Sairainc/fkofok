// Square決済リンクへのアクセスを提供する単純なユーティリティ
// 注: 決済リンクだけを使用するので、Square SDKは必要ありません

export const getSquarePaymentLink = (gender: 'men' | 'women', liffId?: string) => {
  const baseUrl = gender === 'men'
    ? process.env.NEXT_PUBLIC_SQUARE_MEN_PAYMENT_LINK || ''
    : process.env.NEXT_PUBLIC_SQUARE_WOMEN_PAYMENT_LINK || '';

  // LIFF IDが提供されている場合、Deep Linkとして返す
  if (liffId) {
    return `https://liff.line.me/${liffId}/payment/${gender}`;
  }

  return baseUrl;
}; 