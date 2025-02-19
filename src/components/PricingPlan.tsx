'use client'

interface PricingPlanProps {
  price: number
  features: string[]
}

export const PricingPlan = ({ price, features }: PricingPlanProps) => {
  return (
    <section className="py-20">
      <h2 className="text-3xl font-bold text-center mb-12">選べるプラン</h2>
      <div className="max-w-md mx-auto bg-white rounded-lg shadow p-8">
        <div className="text-center mb-8">
          <div className="text-4xl font-bold">¥{price.toLocaleString()}</div>
          <div className="text-gray-500">税込み / 月</div>
        </div>
        <ul className="space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <span className="text-primary mr-2">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
} 