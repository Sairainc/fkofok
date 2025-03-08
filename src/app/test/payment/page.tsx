'use client'

import React from 'react'

export default function TestPaymentPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">支払いテスト</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">男性プラン</h2>
          <p className="mb-4">¥5,000/月</p>
          
          <button
            onClick={() => {
              // 直接Square決済リンクに遷移
              window.location.href = process.env.NEXT_PUBLIC_SQUARE_MEN_PAYMENT_LINK || '';
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            支払いに進む
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">女性プラン</h2>
          <p className="mb-4">¥3,000/月</p>
          
          <button
            onClick={() => {
              // 直接Square決済リンクに遷移
              window.location.href = process.env.NEXT_PUBLIC_SQUARE_WOMEN_PAYMENT_LINK || '';
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            支払いに進む
          </button>
        </div>
      </div>
    </div>
  )
} 