'use client'

import { ShieldCheckIcon, UserGroupIcon, LockClosedIcon, CheckBadgeIcon } from '@heroicons/react/24/solid'

interface SafetyFeatureProps {
  title: string
  description: string
  icon: React.ReactNode
}

interface SafetyFeaturesProps {
  features: SafetyFeatureProps[]
}

export const SafetyFeatures = ({ features }: SafetyFeaturesProps) => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[rgba(255,108,180,0.1)] text-[rgba(255,108,180,0.8)] px-4 py-2 rounded-full mb-4">
            <ShieldCheckIcon className="w-5 h-5" />
            <span className="font-medium">安心・安全への取り組み</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">徹底した身元確認で安全な環境を提供</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            コンパるでは、会員様に安心してご利用いただけるよう、様々な安全対策を実施しています
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-[rgba(255,108,180,0.1)] flex items-center justify-center">
                  <CheckBadgeIcon className="w-6 h-6 text-[rgba(255,108,180,0.8)]" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">完全審査制</h3>
                <p className="text-gray-600 leading-relaxed">
                  プロフィール・写真の確認、本人確認書類での身分証明書の確認など、厳格な審査を実施しています。
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                    <CheckBadgeIcon className="w-4 h-4 text-[rgba(255,108,180,0.8)]" />
                    身分証明書確認
                  </span>
                  <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                    <UserGroupIcon className="w-4 h-4 text-[rgba(255,108,180,0.8)]" />
                    プロフィール審査
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-[rgba(255,108,180,0.1)] flex items-center justify-center">
                  <LockClosedIcon className="w-6 h-6 text-[rgba(255,108,180,0.8)]" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-3">サービス管理体制</h3>
                <p className="text-gray-600 leading-relaxed">
                  イベント後の相互評価システムを導入し、問題のある会員は即座に利用停止とする厳格な管理を行っています。
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                    <ShieldCheckIcon className="w-4 h-4 text-[rgba(255,108,180,0.8)]" />
                    24時間監視体制
                  </span>
                  <span className="inline-flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                    <LockClosedIcon className="w-4 h-4 text-[rgba(255,108,180,0.8)]" />
                    厳格な利用停止制度
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 