'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';

const Navigation = () => {
  const pathname = usePathname();
  const { user, loading } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // スクロール時にナビゲーションバーを表示/非表示
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  const handleScroll = () => {
    const currentScrollPos = window.pageYOffset;
    setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
    setPrevScrollPos(currentScrollPos);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos, visible]);

  if (loading) return null;

  return (
    <nav 
      className={`fixed w-full bg-white/90 backdrop-blur-sm shadow-sm z-50 transition-transform duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-gray-900">
              コンパる
            </Link>
          </div>
          
          {/* デスクトップメニュー */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {user && (
                <>
                  <Link 
                    href="/form" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname.startsWith('/form') 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    登録フォーム
                  </Link>
                  <Link 
                    href="/mypage" 
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      pathname.startsWith('/mypage') 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    マイページ
                  </Link>
                  {user.gender === 'men' && (
                    <Link 
                      href="/payment/men" 
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        pathname.startsWith('/payment/men') 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      支払い
                    </Link>
                  )}
                  {user.gender === 'women' && (
                    <Link 
                      href="/payment/women" 
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        pathname.startsWith('/payment/women') 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      支払い
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* モバイルメニューボタン */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">メニューを開く</span>
              {isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {user && (
              <>
                <Link
                  href="/form"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname.startsWith('/form')
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  登録フォーム
                </Link>
                <Link
                  href="/mypage"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    pathname.startsWith('/mypage')
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  マイページ
                </Link>
                {user.gender === 'men' && (
                  <Link
                    href="/payment/men"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname.startsWith('/payment/men')
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    支払い
                  </Link>
                )}
                {user.gender === 'women' && (
                  <Link
                    href="/payment/women"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname.startsWith('/payment/women')
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    支払い
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 