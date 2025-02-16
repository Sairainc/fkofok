'use client'

import React from 'react'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { Features } from '@/components/Features'
import { CallToAction } from '@/components/CallToAction'
import { ShieldCheckIcon as ShieldCheckIconOutline, SparklesIcon as SparklesIconOutline, HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline'

export default function WomenLP() {
  const features = [
    {
      title: "安全性重視",
      description: "身分証明書確認済みの男性会員のみが登録可能",
      icon: React.createElement(ShieldCheckIconOutline, { className: "w-6 h-6" }),
    },
    {
      title: "質の高いマッチング",
      description: "収入証明書を確認済みの男性会員とマッチング",
      icon: React.createElement(SparklesIconOutline, { className: "w-6 h-6" }),
    },
    {
      title: "プライバシー保護",
      description: "個人情報は厳重に管理され、安心してご利用いただけます",
      icon: React.createElement(HeartIconOutline, { className: "w-6 h-6" }),
    },
  ]

  return (
    <>
      <Header />
      <main>
        <Hero
          title="素敵な出会いを、安心して"
          subtitle="厳選された男性会員との出会いをお届けします"
          imageUrl="/images/women-hero.jpg"
        />
        <Features features={features} />
        <CallToAction />
      </main>
    </>
  )
} 