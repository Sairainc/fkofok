'use client'

import React, { useEffect, useState } from 'react'

interface FloatingCTAProps {
  _text: string
  buttonText: string
}

export const FloatingCTA = ({ _text, buttonText }: FloatingCTAProps) => {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // スクロールに応じてボタンの表示/非表示を制御
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsVisible(currentScrollY < lastScrollY || currentScrollY < 100)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : 'translate-y-24'
    }`}>
      <a
        href={process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#06C755] text-white px-8 py-4 rounded-full font-bold hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
      >
        <img 
          src="/images/line-icon.png" 
          alt="LINE" 
          className="w-6 h-6"
        />
        {buttonText}
      </a>
    </div>
  )
} 