'use client'

import React from 'react'
// import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { PieChart } from '@/components/Charts'
import { Testimonials } from '@/components/Testimonials'
import { SafetyFeatures } from '@/components/SafetyFeatures'
import { Footer } from '@/components/Footer'
import { FloatingCTA } from '@/components/FloatingCTA'
import { 
  ClockIcon, 
  UserGroupIcon, 
  BuildingOfficeIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  StarIcon,
  ChartBarIcon,
  ScaleIcon,
  ChatBubbleBottomCenterTextIcon,
  CheckCircleIcon,
  CurrencyYenIcon
} from '@heroicons/react/24/outline'
import { MemberGallery } from '@/components/MemberGallery'
import Image from 'next/image'

export default function WomenLP() {
  const heroProps = {
    title: "女性に人気の合コンマッチング",
    subtitle: "完全審査制で安心、お友達と一緒に参加できます",
    description: "完全審査制で安心、お友達と一緒に参加できます",
    imageUrl: "/images/women_hero.jpg",
    buttonText: "今すぐLINEで始める",
    overlay: true
  }

  const howToUse = [
    {
      title: "Step 1: LINEで友だち追加",
      description: "まずはLINEで友だち追加をして、簡単な質問に答えるだけ！",
      icon: React.createElement(ClockIcon),
    },
    {
      title: "Step 2: 合コン日時を選択",
      description: "参加可能な日時を選んで、あとはAIにお任せ",
      icon: React.createElement(UserGroupIcon),
    },
    {
      title: "Step 3: 当日お店に集合",
      description: "指定された時間に、お店に集合するだけでOK！",
      icon: React.createElement(BuildingOfficeIcon),
    },
  ]

  const whyChooseUs = [
    {
      title: "いつでも1人で合コンに行ける",
      description: "気軽に参加できます",
      icon: React.createElement(UserGroupIcon, { className: "w-6 h-6" }),
    },
    {
      title: "男女4人の合コンをAIが自動でセッティング",
      description: "面倒な調整は不要です",
      icon: React.createElement(ClockIcon, { className: "w-6 h-6" }),
    },
    {
      title: "時間や場所の事前連絡も不要",
      description: "すべて自動で設定されます",
      icon: React.createElement(BuildingOfficeIcon, { className: "w-6 h-6" }),
    },
  ]

  const menAgeData = {
    labels: ['20-22歳', '23-25歳', '26-28歳', '29-31歳', '32-34歳'],
    data: [15, 35, 30, 15, 5],
    colors: [
      'rgba(255, 108, 180, 0.3)',  // 薄い
      'rgba(255, 108, 180, 0.8)',    // 濃い（メインターゲット）
      'rgba(255, 108, 180, 0.3)',  // 薄い
      'rgba(255, 108, 180, 0.4)',  // 薄い
      'rgba(255, 108, 180, 0.1)'   // 薄い
    ]
  }

  const _womenAgeData = {
    labels: ['20代前半', '20代後半', '30代前半', '30代後半'],
    data: [10, 25, 46, 19],
  }

  const testimonials = [
    {
      gender: "女性",
      age: "25歳",
      occupation: "看護師",
      location: "港区",
      image: "/images/25歳 日本人女性 看護師.jpg",
      comment: "友人に勧められて参加してみましたが、想像以上に素敵な体験でした。男性陣は皆さん礼儀正しく、楽しい会話が弾みました。収入証明書の確認があるので、しっかりとした方々ばかりで安心感がありました。また、運営側のフォローも手厚く、初参加でも緊張せずに楽しめました。",
      point: "高収入で誠実な男性と出会える"
    },
    {
      gender: "女性",
      age: "28歳",
      occupation: "会社員",
      location: "渋谷区",
      image: "/images/28歳 日本人女性.jpg",
      comment: "仕事が忙しく、出会いの機会を探すのが難しかったのですが、コンパるのおかげで気軽に素敵な出会いができました。特に、参加者全員が身分証明書で本人確認済みなので、安心して参加できたのが良かったです。",
      point: "身バレの心配なく、安全に参加できる"
    },
    {
      gender: "女性",
      age: "32歳",
      occupation: "経営者",
      location: "中央区",
      image: "/images/28歳 日本人女性 経営者.jpg",
      comment: "普段は仕事が忙しく、合コンの日程調整が大変でしたが、コンパるは空いている時間に気軽に参加できるのが魅力です。実際に参加してみると、共通の話題も多く、とても充実した時間を過ごせました。",
      point: "忙しい社会人でも気軽に参加できる"
    }
  ]

  const safetyFeatures = [
    {
      title: "完全審査制",
      description: "プロフィール・写真を確認、本人確認書類での身分証明書の確認など、厳格な審査を実施しています。",
      icon: React.createElement(ShieldCheckIcon),
    },
    {
      title: "サービス管理体制",
      description: "イベント後の相互評価システムを導入し、問題のある会員は即座に利用停止とする厳格な管理を行っています。",
      icon: React.createElement(LockClosedIcon),
    },
    {
      title: "女性同士で参加可能",
      description: "お友達と一緒に参加できるので、初めての方でも緊張せずリラックスして楽しめます。",
      icon: React.createElement(UserGroupIcon),
    },
  ]

  const registeredMembers = [
    {
      id: 1,
      image: "/images/28歳 IT企業勤務 メガネ.jpg",
      age: 28,
      occupation: "IT企業勤務",
      location: "渋谷区"
    },
    {
      id: 2,
      image: "/images/24歳 CEO.jpg",
      age: 32,
      occupation: "経営者",
      location: "中央区"
    },
    {
      id: 3,
      image: "/images/30歳 商社マン.jpg",
      age: 30,
      occupation: "商社",
      location: "港区"
    },
    {
      id: 4,
      image: "/images/日本人男性 35歳 医者.jpg",
      age: 35,
      occupation: "医師",
      location: "新宿区"
    },
  ]

  return (
    <>
      {/* <Header /> */}
      <main>
        {React.createElement(Hero, heroProps)}
        
        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-[rgba(255,108,180,0.1)] text-[rgba(255,108,180,0.8)] px-4 py-2 rounded-full mb-4">
                {React.createElement(ClockIcon, { className: "w-5 h-5" })}
                <span className="font-medium">簡単3ステップ</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">今すぐ始められる</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                LINEで友だち追加から参加までわずか3ステップ。面倒な手続きは一切ありません。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {howToUse.map((step, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative">
                  <div className="absolute -top-3 -left-3 w-10 h-10 bg-[rgba(255,108,180,0.1)] text-[rgba(255,108,180,0.8)] rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-[rgba(255,108,180,0.1)] flex items-center justify-center mb-6">
                      <div className="w-8 h-8 text-[rgba(255,108,180,0.8)]">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[rgba(255,108,180,0.1)] text-[rgba(255,108,180,0.8)] px-4 py-2 rounded-full mb-4">
              {React.createElement(StarIcon, { className: "w-5 h-5" })}
              <span className="font-medium">選ばれる3つの理由</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">コンパるが選ばれる理由</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              多くのお客様に支持されている3つの特徴をご紹介します
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {whyChooseUs.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:-translate-y-1">
                <div className="w-16 h-16 rounded-full bg-[rgba(255,108,180,0.1)] flex items-center justify-center mb-6 mx-auto">
                  <div className="w-8 h-8 text-[rgba(255,108,180,0.8)]">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-3 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-[rgba(255,108,180,0.1)] text-[rgba(255,108,180,0.8)] px-4 py-2 rounded-full mb-4">
                {React.createElement(UserGroupIcon, { className: "w-5 h-5" })}
                <span className="font-medium">厳選された男性会員</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">理想の出会いが待っている</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                身元確認済みの信頼できる会員のみが参加しています
              </p>
            </div>

            {React.createElement(MemberGallery, { members: registeredMembers })}

            <div className="mt-20">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 bg-[rgba(255,108,180,0.1)] text-[rgba(255,108,180,0.8)] px-4 py-2 rounded-full mb-4">
                  {React.createElement(ChartBarIcon, { className: "w-5 h-5" })}
                  <span className="font-medium">20代後半が中心</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">魅力的な年齢層が集まる</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  理想的な年齢層の会員様が多数在籍しています
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  {React.createElement(PieChart, { data: menAgeData })}
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm">
                  <div className="space-y-6">
                    <div>
                      <div className="text-2xl font-bold text-[rgba(255,108,180,0.8)] mb-2">80%</div>
                      <p className="text-gray-700">が20代後半〜30代前半の男性</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[rgba(255,108,180,0.8)] mb-2">65%</div>
                      <p className="text-gray-700">が年収600万円以上</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[rgba(255,108,180,0.8)] mb-2">TOP3</div>
                      <p className="text-gray-700">人気職種</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="bg-[rgba(255,108,180,0.1)] text-[rgba(255,108,180,0.8)] px-3 py-1 rounded-full text-sm">IT企業</span>
                        <span className="bg-[rgba(255,108,180,0.1)] text-[rgba(255,108,180,0.8)] px-3 py-1 rounded-full text-sm">経営者</span>
                        <span className="bg-[rgba(255,108,180,0.1)] text-[rgba(255,108,180,0.8)] px-3 py-1 rounded-full text-sm">医師</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-[rgba(255,108,180,0.1)] text-[rgba(255,108,180,0.8)] px-4 py-2 rounded-full mb-4">
                {React.createElement(ChatBubbleBottomCenterTextIcon, { className: "w-5 h-5" })}
                <span className="font-medium">98%が満足</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">実際の参加者の声</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                実際に参加された方々の生の声をご紹介します。<br />
                多くの方にご満足いただいております。
              </p>
            </div>
            <div className="max-w-5xl mx-auto">
              {React.createElement(Testimonials, { testimonials })}
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-[rgba(255,108,180,0.1)] text-[rgba(255,108,180,0.8)] px-4 py-2 rounded-full mb-4">
                {React.createElement(CurrencyYenIcon, { className: "w-5 h-5" })}
                <span className="font-medium">料金プラン</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">明確な料金体系</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                女性向けの特別価格でご利用いただけます
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="bg-[rgba(255,108,180,0.05)] rounded-2xl p-8 shadow-sm border-2 border-[rgba(255,108,180,0.2)] relative mx-auto max-w-md">
                <div className="absolute -top-3 -right-3 bg-[rgba(255,108,180,0.8)] text-white px-4 py-1 rounded-full text-sm">女性限定</div>
                <h3 className="text-xl font-bold mb-4">月額プラン</h3>
                <div className="text-3xl font-bold mb-4">¥2,980<span className="text-base font-normal text-gray-600">/月（税込）</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-2">
                    {React.createElement(CheckCircleIcon, { className: "w-5 h-5 text-[rgba(255,108,180,0.8)]" })}
                    <span>合コン保証付き</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {React.createElement(CheckCircleIcon, { className: "w-5 h-5 text-[rgba(255,108,180,0.8)]" })}
                    <span>いつでもキャンセル可能</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {React.createElement(CheckCircleIcon, { className: "w-5 h-5 text-[rgba(255,108,180,0.8)]" })}
                    <span>全機能利用可能</span>
                  </li>
                  <li className="flex items-center gap-2">
                    {React.createElement(CheckCircleIcon, { className: "w-5 h-5 text-[rgba(255,108,180,0.8)]" })}
                    <span>月額制サブスクリプション</span>
                  </li>
                </ul>
                <button className="w-full py-2 px-4 rounded-full bg-[rgba(255,108,180,0.8)] text-white hover:bg-[rgba(255,108,180,0.9)] transition-colors">
                  今すぐ始める
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-[rgba(255,108,180,0.1)] text-[rgba(255,108,180,0.8)] px-4 py-2 rounded-full mb-4">
                {React.createElement(ShieldCheckIcon, { className: "w-5 h-5" })}
                <span className="font-medium">厳選された会場</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">人気エリアで開催</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                おしゃれな雰囲気のお店を厳選してご用意しています
              </p>
            </div>
            <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative h-64 rounded-2xl overflow-hidden group">
                {React.createElement(Image, { 
                  src: "/images/恵比寿ガーデンプレイス フリー写真.jpg",
                  alt: "恵比寿エリア",
                  width: 800,
                  height: 600,
                  className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                })}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">恵比寿</h3>
                  <p className="text-white/80">
                    洗練された雰囲気のレストラン・カフェを厳選
                  </p>
                </div>
              </div>
              
              <div className="relative h-64 rounded-2xl overflow-hidden group">
                {React.createElement(Image, { 
                  src: "/images/夜の銀座 フリー写真素材.jpg",
                  alt: "銀座・新橋エリア",
                  width: 800,
                  height: 600,
                  className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                })}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-2xl font-bold text-white mb-2">銀座・新橋</h3>
                  <p className="text-white/80">
                    上質な空間で大人の出会いを演出
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-[rgba(255,108,180,0.1)] text-[rgba(255,108,180,0.8)] px-4 py-2 rounded-full mb-4">
                {React.createElement(ScaleIcon, { className: "w-5 h-5" })}
                <span className="font-medium">選ばれる理由</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">他にはない特別な体験</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                コンパるならではの特徴をご紹介します
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
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

              <div className="bg-[rgba(255,108,180,0.05)] rounded-2xl p-8 shadow-sm border-2 border-[rgba(255,108,180,0.2)] relative">
                <div className="absolute -top-3 -right-3 bg-[rgba(255,108,180,0.8)] text-white px-4 py-1 rounded-full text-sm">
                  おすすめ
                </div>
                <div className="text-xl font-bold text-[rgba(255,108,180,0.8)] mb-6">コンパる</div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-[rgba(255,108,180,0.8)] text-xl">○</span>
                    <p className="text-gray-700">空いている時間に気軽に参加可能</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[rgba(255,108,180,0.8)] text-xl">○</span>
                    <p className="text-gray-700">身分証明書で本人確認済み</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[rgba(255,108,180,0.8)] text-xl">○</span>
                    <p className="text-gray-700">キャンセル保証制度あり</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-[rgba(255,108,180,0.8)] text-xl">○</span>
                    <p className="text-gray-700">厳選された会場を事前に用意</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {React.createElement(SafetyFeatures, { features: safetyFeatures })}

        {React.createElement(FloatingCTA, { 
          _text: "今LINE登録した方限定 初回合コン無料！",
          buttonText: "今すぐLINEで始める"
        })}
      </main>
      
      {React.createElement(Footer)}
    </>
  )
} 