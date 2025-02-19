'use client'

interface SafetyFeature {
  title: string
  description: string
  icon: React.ReactElement
}

interface SafetyFeaturesProps {
  features: SafetyFeature[]
}

export const SafetyFeatures = ({ features }: SafetyFeaturesProps) => {
  return (
    <section className="py-20">
      <h2 className="text-3xl font-bold text-center mb-12">安心安全の取り組み</h2>
      <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex-shrink-0 text-primary">{feature.icon}</div>
            <div>
              <h3 className="font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
} 