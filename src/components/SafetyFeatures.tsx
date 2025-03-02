'use client'

import React from 'react'
import { ShieldCheckIcon } from '@heroicons/react/24/solid'

interface SafetyFeatureProps {
  title: string
  description: string
  icon: React.ReactNode
}

interface SafetyFeaturesProps {
  features: SafetyFeatureProps[]
}

export const SafetyFeatures: React.FC<SafetyFeaturesProps> = ({ features }) => {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[rgba(255,108,180,0.1)] text-[rgba(255,108,180,0.8)] px-4 py-2 rounded-full mb-4">
            {React.createElement(ShieldCheckIcon, { className: "w-5 h-5" })}
            <span className="font-medium">安心・安全への取り組み</span>
          </div>
          <h2 className="text-3xl font-bold mb-4">徹底した身元確認で安全な環境を提供</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            コンパるでは、会員様に安心してご利用いただけるよう、様々な安全対策を実施しています
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-[rgba(255,108,180,0.1)] flex items-center justify-center mb-6">
                  <div className="w-8 h-8 text-[rgba(255,108,180,0.8)]">
                    {feature.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
} 