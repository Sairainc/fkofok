'use client'

import { getStripe } from '@/utils/stripe'
import { Button } from './Button'
import { useUser } from '@/hooks/useUser'

type PaymentButtonProps = {
  priceId: string
  _userId: string
}

export const PaymentButton = ({ priceId, _userId }: PaymentButtonProps) => {
  const { user, loading } = useUser()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>ログインが必要です</div>

  const handlePayment = async () => {
    try {
      const stripe = await getStripe()
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: user.id,
        }),
      })
      
      const { id: sessionId } = await response.json()
      
      await stripe?.redirectToCheckout({ sessionId })
    } catch (error) {
      console.error('Payment error:', error)
    }
  }

  return (
    <Button onClick={handlePayment}>
      支払いに進む
    </Button>
  )
} 