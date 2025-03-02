'use client'

import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <nav className="flex justify-center space-x-6 mb-8">
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900">利用規約</a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900">特商法に基づく表記</a>
          <a href="#" className="text-sm text-gray-500 hover:text-gray-900">プライバシーポリシー</a>
        </nav>
        <p className="text-sm text-gray-500">© 2024 コンパる All rights reserved.</p>
      </div>
    </footer>
  )
} 