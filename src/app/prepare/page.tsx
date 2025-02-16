'use client'

export default function Prepare() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-sm">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">
            登録ありがとうございます
          </h1>
          <p className="text-gray-600">
            AIがあなたに合う合コンを探しております。
            しばらくお待ちください。
          </p>
          <div className="animate-pulse">
            <div className="w-16 h-16 mx-auto">
              <svg className="w-full h-full text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 