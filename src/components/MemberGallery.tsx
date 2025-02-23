'use client'

import React from 'react'
import Image from 'next/image'

interface Member {
  id: number
  image: string
  age: number
  occupation: string
  location: string
}

interface MemberGalleryProps {
  members: Member[]
}

export const MemberGallery = ({ members }: MemberGalleryProps) => {
  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex gap-6 py-8">
          {members.map((member) => (
            <div 
              key={member.id}
              className="flex-none w-72 bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={member.image}
                  alt={`Member ${member.id}`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="p-6 text-white bg-black/40">
                <div className="text-lg font-medium">{member.age}歳</div>
                <div className="text-sm text-gray-300">{member.occupation}</div>
                <div className="text-sm text-gray-300">{member.location}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 