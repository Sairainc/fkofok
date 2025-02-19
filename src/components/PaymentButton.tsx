'use client'

import { getStripe } from '@/utils/stripe'
import { Button } from './Button'
import { useUser } from '@/hooks/useUser'

type PaymentButtonProps = {
  priceId: string
}

export const PaymentButton = ({ priceId }: PaymentButtonProps) => {
  const { user, loading } = useUser()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>ログインが必要です</div>

  const handlePayment = async () => {
    try {
      const stripe = await getStripe()
      const response = await fetch('/api/payment/checkout', {
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
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error)
      }

      const { id: sessionId } = await response.json()
      await stripe?.redirectToCheckout({ sessionId })
    } catch (error) {
      console.error('Payment error:', error)
      alert('決済処理中にエラーが発生しました。もう一度お試しください。')
    }
  }

  return (
    <Button onClick={handlePayment}>
      支払いに進む
    </Button>
  )
} 