'use client'

import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function Payment() {
  const handlePayment = async () => {
    try {
      const stripe = await stripePromise
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // 支払い情報
        }),
      })
      
      const session = await response.json()
      
      // Stripeのチェックアウトページにリダイレクト
      await stripe?.redirectToCheckout({
        sessionId: session.id,
      })
    } catch (error) {
      console.error('Payment error:', error)
    }
  }

  return (
    <main className="min-h-screen">
      <h1>決済ページ</h1>
      <button
        onClick={handlePayment}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        決済する
      </button>
    </main>
  )
} 