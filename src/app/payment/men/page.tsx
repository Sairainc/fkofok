'use client'

import { useUser } from '@/hooks/useUser'

const MEN_PLANS = {
  subscription: {
    amount: 4980,
    cancelProtection: 5000,
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

  const handlePayment = async () => {
    if (!user) {
      window.location.href = '/auth'
      return
    }

    if (user.gender !== 'men') {
      window.location.href = '/payment/women'
      return
    }

    try {
      const paymentUrl = process.env.NEXT_PUBLIC_SQUARE_MEN_PAYMENT_LINK || ''
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
              <div>
                <div className="text-3xl font-bold">¥{MEN_PLANS.subscription.amount.toLocaleString()}</div>
                <div className="mt-2 text-lg text-gray-600">
                  + キャンセルプロテクト ¥{MEN_PLANS.subscription.cancelProtection.toLocaleString()}
                  <p className="text-sm text-gray-500 mt-1">※合コンに出席した場合は返金されます</p>
                </div>
                <div className="mt-4 text-2xl font-bold text-green-600">
                  合計: ¥{(MEN_PLANS.subscription.amount + MEN_PLANS.subscription.cancelProtection).toLocaleString()}
                </div>
              </div>
              
              <ul className="space-y-3">
                {MEN_PLANS.subscription.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <div style={{
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                width: '259px',
                background: '#FFFFFF',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '-2px 10px 5px rgba(0, 0, 0, 0)',
                borderRadius: '10px',
                fontFamily: 'SQ Market, SQ Market, Helvetica, Arial, sans-serif',
                margin: '0 auto'
              }}>
                <div style={{ padding: '20px' }}>
                  <p style={{
                    fontSize: '18px',
                    lineHeight: '20px',
                    fontWeight: '600'
                  }}>¥9,980</p>
                  <a 
                    target="_blank" 
                    href="https://checkout.square.site/merchant/MLXPYMSBZ6XSR/checkout/MVQASD6HINKGHJORXT6GUCM7" 
                    style={{
                      display: 'inline-block',
                      fontSize: '18px',
                      lineHeight: '48px',
                      height: '48px',
                      color: '#ffffff',
                      minWidth: '212px',
                      backgroundColor: '#006aff',
                      textAlign: 'center',
                      boxShadow: '0 0 0 1px rgba(0,0,0,.1) inset',
                      borderRadius: '50px',
                      textDecoration: 'none'
                    }}
                  >
                    今すぐ購入する
                  </a>
                </div>
              </div>
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

              <div style={{
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                width: '259px',
                background: '#FFFFFF',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '-2px 10px 5px rgba(0, 0, 0, 0)',
                borderRadius: '10px',
                fontFamily: 'SQ Market, SQ Market, Helvetica, Arial, sans-serif',
                margin: '0 auto'
              }}>
                <div style={{ padding: '20px' }}>
                  <p style={{
                    fontSize: '18px',
                    lineHeight: '20px',
                    fontWeight: '600'
                  }}>¥4,980</p>
                  <a 
                    target="_blank" 
                    href="https://square.link/u/dFxGMdFC" 
                    style={{
                      display: 'inline-block',
                      fontSize: '18px',
                      lineHeight: '48px',
                      height: '48px',
                      color: '#ffffff',
                      minWidth: '212px',
                      backgroundColor: '#006aff',
                      textAlign: 'center',
                      boxShadow: '0 0 0 1px rgba(0,0,0,.1) inset',
                      borderRadius: '50px',
                      textDecoration: 'none'
                    }}
                  >
                    今すぐ購入する
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 