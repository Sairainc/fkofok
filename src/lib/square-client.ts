import { Client, Environment } from 'square'

// Square APIクライアントの初期化
export const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: Environment.Sandbox // 本番環境に移行する際はProductionに変更
})

// 支払いリンクを生成する関数
export const createPaymentLink = async (
  amount: number,
  orderId: string,
  isSubscription: boolean
) => {
  try {
    const response = await squareClient.checkoutApi.createPaymentLink({
      idempotencyKey: `${orderId}_${Date.now()}`,
      quickPay: {
        name: isSubscription ? 'サブスクリプション' : '都度払い',
        priceMoney: {
          amount: amount,
          currency: 'JPY'
        }
      },
      checkoutOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_URL}/payment/success`,
        askForShippingAddress: false,
      }
    })

    if (response.result.paymentLink?.url) {
      return response.result.paymentLink.url
    }
    throw new Error('Failed to create payment link')
  } catch (error) {
    console.error('Error creating payment link:', error)
    throw error
  }
} 