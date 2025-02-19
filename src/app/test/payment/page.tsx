'use client'

import { PaymentButton } from '@/components/PaymentButton'

export default function TestPayment() {
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Payment Test</h1>
      <PaymentButton 
        priceId="price_test" // Stripeダッシュボードで作成したテスト用プライスID
      />
    </div>
  )
} 