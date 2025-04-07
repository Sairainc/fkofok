// 支払いリンクを生成する関数
export const createPaymentLink = async (
  amount: number,
  orderId: string,
  isSubscription: boolean
) => {
  try {
    // 支払いリンクの生成処理
    return 'https://example.com/payment'
  } catch (error) {
    console.error('Error creating payment link:', error)
    throw error
  }
}

// Squareの支払いボタンを生成する関数
export const createSquareButton = async (amount: number) => {
  const button = document.createElement('button')
  button.textContent = `¥${amount.toLocaleString()}で支払う`
  button.className = 'square-payment-button'
  button.onclick = async () => {
    try {
      // 支払い処理
      window.location.href = `https://example.com/payment?amount=${amount}`
    } catch (error) {
      console.error('Payment error:', error)
    }
  }
  return button
} 