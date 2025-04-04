'use client'

import { useUser } from '@/hooks/useUser'

type PaymentButtonProps = {
  priceId: string
}

export function PaymentButton({ priceId }: PaymentButtonProps) {
  const { user, loading } = useUser()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>ログインが必要です</div>

  const handlePayment = async () => {
    try {
      // Square決済APIを呼び出す
      const response = await fetch('/api/payment/square-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
          gender: user.gender,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Payment initialization failed')
      }

      // Squareの決済ページにリダイレクト
      window.location.href = data.checkoutUrl
    } catch (error) {
      console.error('Payment error:', error)
      alert(error instanceof Error ? error.message : '決済処理中にエラーが発生しました。もう一度お試しください。')
    }
  }

  return (
    <button
      onClick={handlePayment}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      支払いに進む
    </button>
  )
} 