'use client'

import { ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import React from 'react'

interface TestimonialProps {
  gender: string
  age: string
  occupation: string
  location: string
  image: string
  comment: string
  point: string
}

interface TestimonialsProps {
  testimonials: TestimonialProps[]
}

export const Testimonials = ({ testimonials }: TestimonialsProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20">
                {React.createElement(Image, {
                  src: testimonial.image,
                  alt: `${testimonial.gender} ${testimonial.age}`,
                  width: 160,
                  height: 160,
                  className: "w-20 h-20 rounded-full object-cover object-top"
                })}
              </div>
              <div>
                <div className="font-bold text-lg">{testimonial.age}</div>
                <div className="text-gray-600">{testimonial.occupation}</div>
                <div className="text-gray-600">{testimonial.location}</div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                {React.createElement(ChatBubbleBottomCenterTextIcon, { className: "w-4 h-4" })}
                {testimonial.point}
              </div>
              <p className="text-gray-700 leading-relaxed">
                {testimonial.comment}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 