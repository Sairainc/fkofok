'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PaymentSuccess() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/prepare')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          決済が完了しました
        </h1>
        <p className="text-gray-600 mb-8">
          ご登録ありがとうございます。
          まもなくマッチング準備ページに移動します。
        </p>
        <div className="animate-pulse">
          <div className="w-16 h-16 mx-auto">
            <svg className="w-full h-full text-green-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
} 