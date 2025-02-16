'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from './Button'

export const Header = () => {
  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {React.createElement(Link, { href: "/", className: "text-xl font-bold" }, 
            <div>
              <span className="text-primary">Matching</span>
              <span className="text-gray-700">Service</span>
            </div>
          )}
          <nav className="flex gap-4">
            <Button
              onClick={() => {}}
              className="bg-primary text-white"
            >
              無料で始める
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
} 