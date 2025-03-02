'use client'

import React, { useEffect, useState } from 'react'

interface FloatingCTAProps {
  _text: string
  buttonText: string
}

export const FloatingCTA: React.FC<FloatingCTAProps> = ({ _text, buttonText }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])

  return (
    <button 
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#06C755] text-white px-12 py-4 rounded-full font-bold hover:bg-[#06C755]/90 transition-all text-lg flex items-center gap-3 shadow-lg transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-[200%]'}`}
    >
      {buttonText}
    </button>
  )
} 