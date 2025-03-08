import { NextResponse } from 'next/server'
import { getSquarePaymentLink } from '@/lib/square'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { userId, gender } = await request.json()

    // ユーザーの性別を確認
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('gender')
      .eq('line_id', userId)
      .single()

    if (userError) {
      console.error('Supabase error:', userError)
      return NextResponse.json(
        { error: 'ユーザー情報の取得に失敗しました' },
        { status: 400 }
      )
    }

    if (userData?.gender !== gender) {
      return NextResponse.json(
        { error: '不正なアクセスです' },
        { status: 400 }
      )
    }

    // 決済リンクを取得
    const checkoutUrl = getSquarePaymentLink(gender as 'men' | 'women')
    
    if (!checkoutUrl) {
      return NextResponse.json(
        { error: '決済リンクが設定されていません' },
        { status: 500 }
      )
    }

    // メタデータをデータベースに保存（オプション）
    try {
      await supabase
        .from('payment_requests')
        .insert({
          line_id: userId,
          gender,
          payment_provider: 'square',
          status: 'pending',
          created_at: new Date().toISOString(),
        })
    } catch (dbError) {
      console.error('Failed to save payment request to database:', dbError)
      // ここではDBエラーがあっても進める
    }

    return NextResponse.json({ 
      checkoutUrl
    })
  } catch (error) {
    console.error('Square error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Checkout failed: ${errorMessage}` },
      { status: 500 }
    )
  }
} 