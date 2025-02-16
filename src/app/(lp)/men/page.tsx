'use client'

import React from 'react'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { Features } from '@/components/Features'
import { CallToAction } from '@/components/CallToAction'
import { HeartIcon as HeartIconOutline, StarIcon as StarIconOutline, UserGroupIcon as UserGroupIconOutline } from '@heroicons/react/24/outline'

export default function MenLP() {
  const features = [
    {
      title: "厳選されたマッチング",
      description: "プロフィール審査を通過した質の高い女性会員とマッチング",
      icon: React.createElement(HeartIconOutline, { className: "w-6 h-6" }),
    },
    {
      title: "安心の身分証明書確認",
      description: "全会員の身分証明書を確認済み。安全に出会いを探せます",
      icon: React.createElement(StarIconOutline, { className: "w-6 h-6" }),
    },
    {
      title: "充実したサポート",
      description: "24時間体制のカスタマーサポートで、安心してご利用いただけます",
      icon: React.createElement(UserGroupIconOutline, { className: "w-6 h-6" }),
    },
  ]

  return (
    <>
      <Header />
      <main>
        <Hero
          title="理想の出会いを見つけよう"
          subtitle="厳選された女性会員との出会いをお届けします"
          imageUrl="/images/men-hero.jpg"
        />
        <Features features={features} />
        <CallToAction />
      </main>
    </>
  )
} 