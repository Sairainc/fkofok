// src/components/CallToAction.tsx
'use client'

import { useRouter } from 'next/navigation'

export const CallToAction = () => {
  const router = useRouter()

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <button
          onClick={() => router.push('/form')}
          className="px-8 py-3 text-lg font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
        >
          プロフィール登録
        </button>
      </div>
    </div>
  )
}
