'use client';

import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ProfileEditForm from "@/components/ProfileEditForm";
import PreferencesEditForm from "@/components/PreferencesEditForm";

export default function MyPage() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      router.push('/auth');
      return;
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) return null;

  // 性別の変換（型アサーション追加）
  const _mappedGender = (user.gender as string) === 'male' || (user.gender as string) === 'メンズ' ? 'men' : 'women';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* 戻るアイコン */}
        <div className="mb-4 flex items-center">
          <a 
            href="https://www.comparu.net" 
            className="flex items-center text-gray-600 hover:text-primary transition-colors"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 mr-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            <span>戻る</span>
          </a>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">マイページ</h1>
        
        {/* タブナビゲーション */}
        <div className="mb-8">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-3 px-6 font-medium text-sm focus:outline-none ${
                activeTab === 'profile'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              プロフィール編集
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-3 px-6 font-medium text-sm focus:outline-none ${
                activeTab === 'preferences'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              希望条件編集
            </button>
          </div>
        </div>
        
        {/* コンテンツエリア */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {activeTab === 'profile' && (
            <>
              <h2 className="text-2xl font-semibold mb-6">プロフィール編集</h2>
              <ProfileEditForm userId={user.id} />
            </>
          )}
          
          {activeTab === 'preferences' && (
            <>
              <h2 className="text-2xl font-semibold mb-6">希望条件編集</h2>
              <PreferencesEditForm userId={user.id} />
            </>
          )}
        </div>
      </div>
    </div>
  );
} 