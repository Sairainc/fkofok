export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-4xl sm:text-5xl font-bold text-center mb-12">
          あなたにぴったりの出会いを
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* 男性向け */}
          <a 
            href="/men"
            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="
              aspect-[4/3] bg-blue-500 p-8 flex items-center justify-center
              transform group-hover:scale-105 transition-transform duration-300
            ">
              <div className="text-center text-white">
                <h2 className="text-2xl font-bold mb-4">男性の方はこちら</h2>
                <p className="text-lg opacity-90">厳選された女性会員との出会い</p>
              </div>
            </div>
          </a>

          {/* 女性向け */}
          <a 
            href="/women"
            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="aspect-[4/3] bg-primary-women p-8 flex items-center justify-center">
              <div className="text-center text-white">
                <h2 className="text-2xl font-bold mb-4">女性の方はこちら</h2>
                <p className="text-lg opacity-90">安心・安全な出会い</p>
              </div>
            </div>
          </a>
        </div>

        <div className="mt-12 text-center text-gray-600">
          <p className="text-sm">
            ※ 18歳未満の方は利用できません
          </p>
        </div>
      </div>
    </main>
  )
} 