'use client'

import { getStripe } from '@/utils/stripe'
import { Button } from './Button'
import { useUser } from '@/hooks/useUser'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

type PaymentButtonProps = {
  priceId: string
  _userId: string
}

export const PaymentButton = ({ priceId, _userId }: PaymentButtonProps) => {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // ユーザーの性別と現在のページが一致しない場合、適切なページにリダイレクト
      const currentPath = window.location.pathname
      if (user.gender === 'men' && currentPath.includes('/payment/women')) {
        router.push('/payment/men')
      } else if (user.gender === 'women' && currentPath.includes('/payment/men')) {
        router.push('/payment/women')
      }
    }
  }, [user, loading, router])

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
          userId: user.id, // LINEユーザーIDを使用
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