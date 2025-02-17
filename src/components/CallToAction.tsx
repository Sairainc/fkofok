// src/components/CallToAction.tsx
'use client'

// useRouterのインポートを削除
// import { useRouter } from 'next/navigation'

export const CallToAction = () => {
  // routerの定義を削除
  // const router = useRouter()

  const handleClick = async (_gender: 'men' | 'women') => {
    try {
      // LINEの友だち追加URLに遷移
      window.location.href = process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL!
    } catch (error) {
      console.error('Error:', error)
      alert('エラーが発生しました。もう一度お試しください。')
    }
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <h2 className="text-3xl font-bold text-gray-900">
          今すぐ無料で始めましょう
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          プロフィールを登録して、理想のパートナーを見つけましょう
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleClick('men')}
            className="inline-block px-8 py-3 text-lg font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
          >
            LINEで友だち追加
          </button>
        </div>
      </div>
    </div>
  )
}
