'use client'

import { getStripe } from '@/utils/stripe'
import { Button } from './Button'

type PaymentButtonProps = {
  priceId: string
  userId: string
}

export const PaymentButton = ({ priceId, userId }: PaymentButtonProps) => {
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
          userId,
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