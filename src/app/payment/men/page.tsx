'use client'

import { useUser } from '@/hooks/useUser'
import { createSquarePayment } from '@/lib/square'

const MEN_PLANS = {
  subscription: {
    amount: 4980,
    planId: 'men_subscription',
    title: '男性サブスクリプションプラン',
    description: '月額4,980円でプレミアム機能が使い放題',
    features: [
      'プロフィール審査済みの女性会員とマッチング',
      '優先的なマッチング',
      '24時間のサポート',
      '新機能優先アクセス'
    ]
  },
  oneTime: {
    amount: 3000,
    planId: 'men_one_time',
    title: '男性都度払いプラン',
    description: '1回3,000円でプレミアム機能を利用',
    features: [
      'プロフィール審査済みの女性会員とマッチング',
      '優先的なマッチング',
      '24時間のサポート'
    ]
  }
}

export default function MenPayment() {
  const { user, loading } = useUser({ skipMatchCheck: true })

  const handlePayment = async (paymentType: 'subscription' | 'one_time') => {
    if (!user) {
      window.location.href = '/auth'
      return
    }

    if (user.gender !== 'men') {
      window.location.href = '/payment/women'
      return
    }

    try {
      const plan = paymentType === 'subscription' ? MEN_PLANS.subscription : MEN_PLANS.oneTime
      const { paymentUrl } = await createSquarePayment(
        user.id,
        plan.amount,
        paymentType,
        plan.planId
      )
      window.location.href = paymentUrl
    } catch (error) {
      console.error('Failed to create payment:', error)
      // エラー時の処理を追加
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">男性会員プラン</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* サブスクリプションプラン */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold">{MEN_PLANS.subscription.title}</h2>
                <p className="text-gray-600 mt-2">{MEN_PLANS.subscription.description}</p>
              </div>
              <div className="text-3xl font-bold">¥{MEN_PLANS.subscription.amount.toLocaleString()}</div>
              
              <ul className="space-y-3">
                {MEN_PLANS.subscription.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePayment('subscription')}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                サブスクリプションで始める
              </button>
            </div>
          </div>

          {/* 都度払いプラン */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold">{MEN_PLANS.oneTime.title}</h2>
                <p className="text-gray-600 mt-2">{MEN_PLANS.oneTime.description}</p>
              </div>
              <div className="text-3xl font-bold">¥{MEN_PLANS.oneTime.amount.toLocaleString()}</div>
              
              <ul className="space-y-3">
                {MEN_PLANS.oneTime.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePayment('one_time')}
                className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                都度払いで始める
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 