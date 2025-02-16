import Image from "next/image"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100">
      <main className="container mx-auto px-4 py-12 sm:py-20">
        <div className="text-center space-y-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
            合コンマッチングサービス
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            あなたにぴったりの出会いを。プロフィール審査済みの会員同士で、
            安心・安全な合コンを提供します。
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link 
              href="/men" 
              className="bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark transition-colors"
            >
              男性の方はこちら
            </Link>
            <Link 
              href="/women" 
              className="bg-primary-women text-white px-8 py-3 rounded-lg hover:opacity-90 transition-colors"
            >
              女性の方はこちら
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">安心の身分証明書確認</h3>
              <p className="text-gray-600">全会員の身分証明書を確認済み。なりすまし防止で安心です。</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">充実のマッチング</h3>
              <p className="text-gray-600">価値観や趣味の合う相手とマッチング。楽しい合コンを実現。</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2">手厚いサポート</h3>
              <p className="text-gray-600">専任のコンシェルジュが合コンをサポート。安心してご利用いただけます。</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 