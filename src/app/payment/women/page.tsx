'use client'

import { PaymentButton } from '@/components/PaymentButton'

export default function WomenPayment() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">女性会員プラン</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-semibold">スタンダードプラン</h2>
                <p className="text-gray-600 mt-2">厳選された男性会員とマッチング</p>
              </div>
              <div className="text-3xl font-bold">¥4,800</div>
            </div>
            
            <ul className="space-y-3">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                収入証明書確認済みの男性会員とマッチング
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                プライバシー保護
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                24時間のサポート
              </li>
            </ul>

            <PaymentButton 
              priceId={process.env.NEXT_PUBLIC_STRIPE_WOMEN_PRICE_ID!}
              userId="test_user"
            />
          </div>
        </div>
      </div>
    </div>
  )
} 