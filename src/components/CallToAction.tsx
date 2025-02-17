// src/components/CallToAction.tsx
'use client'

import { useRouter } from 'next/navigation'

export const CallToAction = () => {
  const router = useRouter()

  const handleClick = (gender: 'men' | 'women') => {
    router.push(`/payment/${gender}`)
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <button
          onClick={() => handleClick('men')}
          className="inline-block px-8 py-3 text-lg font-medium text-white bg-primary rounded-lg hover:bg-primary-dark mr-4"
        >
          男性の方はこちら
        </button>
        <button
          onClick={() => handleClick('women')}
          className="inline-block px-8 py-3 text-lg font-medium text-white bg-primary-women rounded-lg hover:opacity-90"
        >
          女性の方はこちら
        </button>
      </div>
    </div>
  )
}
