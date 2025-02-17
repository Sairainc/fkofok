// src/components/CallToAction.tsx
'use client'

// useRouterのインポートを削除
// import { useRouter } from 'next/navigation'

export const CallToAction = () => {
  // routerの定義を削除
  // const router = useRouter()

  const handleClick = async () => {
    try {
      // LINEの友だち追加URLを削除し、フォームページに遷移するように変更
      window.location.href = '/auth'
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
          LINEで簡単ログイン
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleClick}
            className="inline-block px-8 py-3 text-lg font-medium text-white bg-primary rounded-lg hover:bg-primary-dark"
          >
            無料で始める
          </button>
        </div>
      </div>
    </div>
  )
}
