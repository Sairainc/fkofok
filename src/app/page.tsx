import Link from "next/link"
import { Header } from '@/components/Header'
import { Features } from '@/components/Features'
import { ShieldCheckIcon, HeartIcon, UserGroupIcon } from '@heroicons/react/24/outline'

export default function Home() {
  const features = [
    {
      title: "安心・安全",
      description: "身分証明書による本人確認で、安全な出会いを提供します",
      icon: <ShieldCheckIcon className="w-6 h-6" />,
    },
    {
      title: "厳選されたマッチング",
      description: "プロフィール審査済みの会員同士で、質の高い出会いを実現",
      icon: <HeartIcon className="w-6 h-6" />,
    },
    {
      title: "24時間サポート",
      description: "専門スタッフによる手厚いサポートで、安心してご利用いただけます",
      icon: <UserGroupIcon className="w-6 h-6" />,
    },
  ]

  return (
    <>
      <Header />
      <main>
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-4xl w-full text-center mb-12">
            <h1 className="text-4xl font-bold mb-6">
              あなたにぴったりの出会いを
            </h1>
            <p className="text-xl text-gray-600 mb-12">
              安心・安全なマッチングサービスで、素敵な出会いを見つけましょう
            </p>
            
            <div className="flex gap-6 justify-center">
              <Link
                href="/men"
                className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                男性の方はこちら
              </Link>
              <Link
                href="/women"
                className="px-8 py-4 bg-primary-women text-white rounded-lg hover:opacity-90 transition-colors"
              >
                女性の方はこちら
              </Link>
            </div>
          </div>
          <Features features={features} />
        </div>
      </main>
    </>
  )
} 