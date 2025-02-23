interface HeroProps {
  title: string
  subtitle: string
  imageUrl: string
  overlay?: boolean
}

export const Hero = ({ title, subtitle, imageUrl, overlay }: HeroProps) => {
  return (
    <div className="relative h-screen">
      {/* 背景画像 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/images/men_back.png')` }}
      >
        {overlay && <div className="absolute inset-0 bg-black/40" />}
      </div>
      
      {/* コンテンツ */}
      <div className="relative h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-white flex flex-col items-center gap-12">
          {/* レイヤー画像 (上部に配置) */}
          <div className="w-full max-w-[600px] mt-20">
            <img 
              src={imageUrl} 
              alt="Facebook Image.png"
              className="w-full h-auto object-contain"
            />
          </div>
          
          {/* テキストコンテンツ (下部に配置) */}
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              {title}
            </h1>
            <p className="mt-6 text-xl sm:text-2xl max-w-3xl">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 