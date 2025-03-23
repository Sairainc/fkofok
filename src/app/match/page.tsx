'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { supabase } from '@/lib/supabase'

type MatchInfo = {
  id: string
  male_user_1: string
  male_user_2: string
  female_user_1: string
  female_user_2: string
  match_date: string
  status: 'pending' | 'confirmed' | 'cancelled'
}

export default function MatchConfirmation() {
  const { user, loading } = useUser()
  const router = useRouter()
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null)
  const [loadingMatch, setLoadingMatch] = useState(true)

  useEffect(() => {
    const checkMatch = async () => {
      try {
        if (!user?.id) return

        // matchesテーブルから自分のLINE IDを含むマッチを検索
        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .or(`male_user_1.eq."${user.id}",male_user_2.eq."${user.id}",female_user_1.eq."${user.id}",female_user_2.eq."${user.id}"`)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (error && error.code !== 'PGRST116') {
          console.error('マッチ情報取得エラー:', error)
          router.push('/')
          return
        }

        if (data) {
          setMatchInfo(data as MatchInfo)
        } else {
          // マッチが見つからない場合はホームページにリダイレクト
          router.push('/')
        }
      } catch (error) {
        console.error('マッチ確認エラー:', error)
      } finally {
        setLoadingMatch(false)
      }
    }

    if (!loading) {
      checkMatch()
    }
  }, [user, loading, router])

  // ユーザー情報のロード中
  if (loading || loadingMatch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // マッチが見つからない場合
  if (!matchInfo) {
    return null // すでにリダイレクト処理されているので何も表示しない
  }

  // ユーザーの役割を判定（男性1、男性2、女性1、女性2のいずれか）
  const userRole = user?.id === matchInfo.male_user_1 
    ? '男性1' 
    : user?.id === matchInfo.male_user_2 
      ? '男性2' 
      : user?.id === matchInfo.female_user_1 
        ? '女性1' 
        : '女性2'

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours()
    const minutes = date.getMinutes()
    
    return `${year}年${month}月${day}日 ${hours}時${minutes}分`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-auto p-8 bg-white rounded-lg shadow-sm">
        <div className="space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              マッチが確定しました！
            </h1>
            <p className="text-gray-600 mb-6">
              あなたのグループと理想の相手のマッチングが成立しました。
              以下の詳細をご確認ください。
            </p>
          </div>
          
          <div className="border-t border-b border-gray-200 py-4 space-y-3">
            <div>
              <h2 className="text-sm font-medium text-gray-500">あなたの役割</h2>
              <p className="text-lg font-medium text-gray-900">{userRole}</p>
            </div>
            
            <div>
              <h2 className="text-sm font-medium text-gray-500">合コン日時</h2>
              <p className="text-lg font-medium text-gray-900">{formatDate(matchInfo.match_date)}</p>
            </div>
            
            <div>
              <h2 className="text-sm font-medium text-gray-500">ステータス</h2>
              <p className="text-lg font-medium text-primary">
                {matchInfo.status === 'pending' && '確定待ち'}
                {matchInfo.status === 'confirmed' && '確定済み'}
                {matchInfo.status === 'cancelled' && 'キャンセル'}
              </p>
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              詳細については、LINEにてご連絡いたします。<br />
              当日をお楽しみに！
            </p>
            
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark w-full"
            >
              ホームに戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 