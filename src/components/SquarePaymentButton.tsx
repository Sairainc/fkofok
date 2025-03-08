'use client'

import { useState } from 'react'
import { useUser } from '@/hooks/useUser'
import React from 'react'

type SquarePaymentButtonProps = {
  priceId: string
}

export function SquarePaymentButton({ priceId }: SquarePaymentButtonProps): JSX.Element {
  const { user, loading } = useUser()
  const [processingPayment, setProcessingPayment] = useState(false)

  if (loading) return <div>Loading...</div>
  if (!user) return <div>ログインが必要です</div>

  const handlePayment = async () => {
    setProcessingPayment(true)
    try {
      // Squareの決済APIを呼び出す
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
    } finally {
      setProcessingPayment(false)
    }
  }

  return (
    <button
      onClick={handlePayment}
      disabled={processingPayment}
      className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors ${processingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {processingPayment ? '処理中...' : '支払いに進む'}
    </button>
  )
} 