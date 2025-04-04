'use client'

import React from 'react'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <nav className="flex justify-center space-x-6 mb-8">
          <a href="/terms-of-service" className="text-sm text-gray-500 hover:text-gray-900">利用規約</a>
          <a href="/tokushoho" className="text-sm text-gray-500 hover:text-gray-900">特商法に基づく表記</a>
          <a href="/privacy-policy" className="text-sm text-gray-500 hover:text-gray-900">プライバシーポリシー</a>
          <a href="/kojinjoho-hogohoshin" className="text-sm text-gray-500 hover:text-gray-900">個人情報及び特定個人情報保護方針</a>
          <a href="https://mammoth-jackal-f4e.notion.site/1c62a372cdb5803b91faf6f074e6fdd1?pvs=4" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-gray-900">よくある質問</a>
        </nav>
        <p className="text-sm text-gray-500">© 2024 コンパる All rights reserved.</p>
      </div>
    </footer>
  )
} 