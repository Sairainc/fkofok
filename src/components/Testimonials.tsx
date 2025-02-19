'use client'

interface TestimonialProps {
  testimonials: {
    gender: string
    age: string
    occupation: string
    comment: string
  }[]
}

export const Testimonials = ({ testimonials }: TestimonialProps) => {
  return (
    <section className="py-20">
      <h2 className="text-3xl font-bold text-center mb-12">参加者の声</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto px-4">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 mb-4">{testimonial.comment}</p>
            <div className="text-sm text-gray-500">
              {testimonial.gender}・{testimonial.age}・{testimonial.occupation}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
} 