'use client'

import React from 'react'

interface HeroProps {
  title: string
  subtitle: string
  imageUrl: string
  overlay?: boolean
}

export const Hero: React.FC<HeroProps> = ({ title, subtitle, imageUrl: _imageUrl, overlay }) => {
  return (
    <div className="relative h-screen">
      {/* 背景画像 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/images/men_back.png')` }}
      >
        {overlay && <div className="absolute inset-0 bg-black/40" />}
      </div>
      
      {/* コンテンツ */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white flex flex-col items-center gap-12">
          {/* ロゴ画像 */}
          <div className="w-full max-w-[600px] mt-20 relative h-[200px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Facebook Image.png"
              alt="コンパるロゴ"
              className="object-contain w-full h-full"
            />
          </div>
          
          {/* テキストコンテンツ */}
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              {title}
            </h1>
            <p className="mt-6 text-xl sm:text-2xl max-w-3xl">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 