import React from 'react'

interface FeaturesProps {
  features: {
    title: string
    description: string
    icon: React.ReactNode
  }[]
  isSteps?: boolean // Stepスタイル用のフラグを追加
  isElegant?: boolean // 新しいエレガントなスタイル用のフラグ
  isLuxury?: boolean // ラグジュアリー用のフラグを追加
}

export const Features = ({ features, isSteps, isElegant, isLuxury }: FeaturesProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {isSteps ? (
        <div className="relative">
          {/* 接続線 (ラグジュアリー版) */}
          <div className={`absolute top-24 left-[50%] h-[calc(100%-6rem)] w-0.5 
            ${isLuxury ? 'bg-gradient-to-b from-primary via-primary/50 to-primary' : 'bg-primary/20'} 
            -translate-x-[50%] md:hidden`} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`relative ${
                  isLuxury 
                    ? 'bg-white/10 backdrop-blur-sm border border-white/20' 
                    : 'bg-white'
                } rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8`}
              >
                {/* Step番号 (ラグジュアリー版) */}
                <div className={`absolute -top-6 left-[50%] -translate-x-[50%] 
                  w-12 h-12 rounded-full 
                  ${isLuxury 
                    ? 'bg-gradient-to-br from-primary to-primary/80 text-white' 
                    : 'bg-primary text-white'
                  } flex items-center justify-center text-xl font-bold`}>
                  {index + 1}
                </div>
                
                <div className="text-center">
                  <div className={`w-20 h-20 mx-auto flex items-center justify-center rounded-full 
                    ${isLuxury 
                      ? 'bg-white/10 text-primary' 
                      : 'bg-primary/10 text-primary'
                    } mb-8`}>
                    {feature.icon}
                  </div>
                  <h3 className={`text-2xl font-bold mb-4 
                    ${isLuxury ? 'text-white' : 'text-gray-900'}`}>
                    {feature.title}
                  </h3>
                  <p className={`${isLuxury ? 'text-gray-300' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : isElegant ? (
        // エレガントなレイアウト
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* アイコンと装飾 */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 
                            bg-gradient-to-br from-primary/80 to-primary 
                            rounded-2xl rotate-45 transform 
                            group-hover:rotate-[30deg] group-hover:scale-110 
                            transition-all duration-300 shadow-lg">
                <div className="absolute inset-0 -rotate-45 flex items-center justify-center text-white">
                  {feature.icon}
                </div>
              </div>
              
              {/* コンテンツ */}
              <div className="bg-white/80 backdrop-blur-sm pt-12 pb-8 px-6 rounded-2xl
                            border border-gray-100 shadow-sm
                            group-hover:shadow-xl group-hover:-translate-y-1
                            transition-all duration-300">
                <h3 className="text-xl font-bold text-center text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // 通常のFeatureスタイル
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                {feature.icon}
              </div>
              <h3 className="mt-4 text-xl font-semibold">
                {feature.title}
              </h3>
              <p className="mt-2 text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 