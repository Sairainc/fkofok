'use client'

import React from 'react'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { Features } from '@/components/Features'
import { PieChart } from '@/components/Charts'
import { Testimonials } from '@/components/Testimonials'
import { PricingPlan } from '@/components/PricingPlan'
import { ComparisonTable } from '@/components/ComparisonTable'
import { SafetyFeatures } from '@/components/SafetyFeatures'
import { Footer } from '@/components/Footer'
import { FloatingCTA } from '@/components/FloatingCTA'
import { 
  ClockIcon, 
  UserGroupIcon, 
  BuildingOfficeIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline'

export default function WomenLP() {
  const howToUse = [
    {
      title: "仕事が終わったら参加",
      description: "合コンの日時を選ぶ",
      icon: React.createElement(ClockIcon),
    },
    {
      title: "AIが合コンを自動でセッティング",
      description: "自動でマッチングを行います",
      icon: React.createElement(UserGroupIcon),
    },
    {
      title: "待ち合わせのお店に集合！",
      description: "合コン開始",
      icon: React.createElement(BuildingOfficeIcon),
    },
  ]

  const whyChooseUs = [
    {
      title: "安全性重視",
      description: "身分証明書確認済みの男性会員のみが登録可能",
      icon: React.createElement(ShieldCheckIcon, { className: "w-6 h-6" }),
    },
    {
      title: "質の高いマッチング",
      description: "収入証明書を確認済みの男性会員とマッチング",
      icon: React.createElement(UserGroupIcon, { className: "w-6 h-6" }),
    },
    {
      title: "プライバシー保護",
      description: "個人情報は厳重に管理され、安心してご利用いただけます",
      icon: React.createElement(BuildingOfficeIcon, { className: "w-6 h-6" }),
    },
  ]

  const womenAgeData = {
    labels: ['20代前半', '20代後半', '30代前半', '30代後半'],
    data: [30, 45, 17, 18],
  }

  const menAgeData = {
    labels: ['20代前半', '20代後半', '30代前半', '30代後半'],
    data: [10, 25, 46, 19],
  }

  const testimonials = [
    {
      gender: "女性",
      age: "25歳",
      occupation: "看護師",
      comment: "安心して参加できる環境で、楽しい時間を過ごせました。",
    },
    {
      gender: "男性",
      age: "28歳",
      occupation: "IT企業勤務",
      comment: "仕事終わりに気軽に参加できて、素敵な出会いがありました！",
    },
  ]

  const safetyFeatures = [
    {
      title: "完全審査制",
      description: "プロフィールや写真を確認、審査を通過した方のみ利用可能",
      icon: React.createElement(ShieldCheckIcon),
    },
    {
      title: "サービス管理体制",
      description: "コンパるの後に相互評価。問題の報告を受けた会員様は利用停止",
      icon: React.createElement(ShieldCheckIcon),
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
          overlay={true}
        />
        
        <section className="py-20">
          <h2 className="text-3xl font-bold text-center mb-12">How to Use</h2>
          <Features features={howToUse} />
        </section>

        <section className="py-20 bg-gray-50">
          <h2 className="text-3xl font-bold text-center mb-12">コンパるが選ばれる理由</h2>
          <Features features={whyChooseUs} />
        </section>

        <section className="py-20">
          <h2 className="text-3xl font-bold text-center mb-12">会員データ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-6">女性会員</h3>
              <PieChart data={womenAgeData} />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6">男性会員</h3>
              <PieChart data={menAgeData} />
            </div>
          </div>
        </section>

        <Testimonials testimonials={testimonials} />
        
        <section className="py-20 bg-gray-50">
          <h2 className="text-3xl font-bold text-center mb-12">開催エリア</h2>
          <div className="text-center text-xl">
            恵比寿、銀座・新橋
          </div>
        </section>

        <PricingPlan 
          price={2980}
          features={["初回無料合コン付き", "月額プラン", "いつでもキャンセル可能"]}
        />

        <ComparisonTable />
        
        <SafetyFeatures features={safetyFeatures} />

        <FloatingCTA 
          text="今LINE登録した方限定 初回合コン無料！"
          buttonText="今すぐLINEで始める"
        />
      </main>
      
      <Footer />
    </>
  )
} 