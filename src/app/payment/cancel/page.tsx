'use client'

import { useRouter } from 'next/navigation'

export default function PaymentCancel() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          決済がキャンセルされました
        </h1>
        <p className="text-gray-600 mb-8">
          決済を中断しました。
          ご不明な点がございましたら、お気軽にお問い合わせください。
        </p>
        <button
          onClick={() => router.back()}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark"
        >
          戻る
        </button>
      </div>
    </div>
  )
} 