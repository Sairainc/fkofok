type HeroProps = {
  title: string
  subtitle: string
  imageUrl: string
}

export const Hero = ({ title, subtitle, imageUrl }: HeroProps) => {
  return (
    <div className="relative h-screen">
      {/* 背景画像 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>
      
      {/* コンテンツ */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
            {title}
          </h1>
          <p className="mt-6 text-xl sm:text-2xl max-w-3xl">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  )
} 