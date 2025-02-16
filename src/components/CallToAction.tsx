// src/components/CallToAction.tsx
'use client'

export const CallToAction = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <a
          href="/form"
          className="inline-block px-8 py-3 text-lg font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
        >
          プロフィール登録
        </a>
      </div>
    </div>
  )
}
