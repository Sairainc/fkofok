'use client'

import React from 'react'

interface FloatingCTAProps {
  text: string
  buttonText: string
}

export const FloatingCTA = ({ text, buttonText }: FloatingCTAProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-4 z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
        <p className="text-lg font-bold text-gray-900 mb-4 sm:mb-0">
          {text}
        </p>
        <button
          onClick={() => window.location.href = '/auth'}
          className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          {buttonText}
        </button>
      </div>
    </div>
  )
} 