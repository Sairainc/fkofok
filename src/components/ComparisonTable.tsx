'use client'

import { ScaleIcon } from '@heroicons/react/24/outline'

export const ComparisonTable = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <ScaleIcon className="w-5 h-5" />
            <span className="font-medium">他社サービスとの違い</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">従来の合コンとの比較</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            コンパるは、従来の合コンの課題を解決し、より快適な体験を提供します
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* 従来の合コン */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="text-xl font-bold text-gray-400 mb-6">従来の合コン</div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-xl">×</span>
                <p className="text-gray-600">日程調整に時間がかかる</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-xl">×</span>
                <p className="text-gray-600">参加者の身元が不明確</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-xl">×</span>
                <p className="text-gray-600">キャンセルが多発</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-red-500 text-xl">×</span>
                <p className="text-gray-600">会場選びが面倒</p>
              </div>
            </div>
          </div>

          {/* コンパる */}
          <div className="bg-primary/5 rounded-2xl p-8 shadow-sm border-2 border-primary/20 relative">
            <div className="absolute -top-3 -right-3 bg-primary text-white px-4 py-1 rounded-full text-sm">
              おすすめ
            </div>
            <div className="text-xl font-bold text-primary mb-6">コンパる</div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-primary text-xl">○</span>
                <p className="text-gray-700">空いている時間に気軽に参加可能</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary text-xl">○</span>
                <p className="text-gray-700">身分証明書で本人確認済み</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary text-xl">○</span>
                <p className="text-gray-700">キャンセル保証制度あり</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary text-xl">○</span>
                <p className="text-gray-700">厳選された会場を事前に用意</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 