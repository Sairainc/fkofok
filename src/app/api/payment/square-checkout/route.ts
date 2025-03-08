import { NextResponse } from 'next/server'
import { square } from '@/lib/square'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    console.log('Environment variables:', {
      SQUARE_ACCESS_TOKEN: process.env.SQUARE_ACCESS_TOKEN?.slice(0, 10) + '...',
      NEXT_PUBLIC_SQUARE_MEN_PRICE_ID: process.env.NEXT_PUBLIC_SQUARE_MEN_PRICE_ID,
      NEXT_PUBLIC_SQUARE_WOMEN_PRICE_ID: process.env.NEXT_PUBLIC_SQUARE_WOMEN_PRICE_ID,
      NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
    })

    const { priceId, userId, gender } = await request.json()

    if (!process.env.SQUARE_ACCESS_TOKEN) {
      throw new Error('Square access token is not set')
    }

    // ユーザーの性別を確認
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('gender, email')
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

    // 価格IDの検証
    const validPriceIds = {
      men: process.env.NEXT_PUBLIC_SQUARE_MEN_PRICE_ID,
      women: process.env.NEXT_PUBLIC_SQUARE_WOMEN_PRICE_ID,
    }
    
    if (!validPriceIds[gender as keyof typeof validPriceIds]) {
      throw new Error(`Price ID for ${gender} is not set`)
    }

    if (priceId !== validPriceIds[gender as keyof typeof validPriceIds]) {
      return NextResponse.json(
        { error: '不正な価格IDです' },
        { status: 400 }
      )
    }

    // プランに応じた金額を設定（本番環境では実際の金額を設定）
    const amount = gender === 'men' ? 5000 : 3000

    // Square Checkout APIで決済ページを作成
    const response = await square.checkoutApi.createPaymentLink({
      idempotencyKey: `${userId}-${Date.now()}`,
      quickPay: {
        name: gender === 'men' ? '男性会員プラン' : '女性会員プラン',
        priceMoney: {
          amount: amount,
          currency: 'JPY'
        },
        locationId: process.env.SQUARE_LOCATION_ID || '',
      },
      checkoutOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_URL}/payment/success`,
        askForShippingAddress: false,
      },
      prePopulatedData: {
        buyerEmail: userData?.email || '',
      },
    })

    if (response.error) {
      throw new Error(`Square API error: ${response.error.message}`)
    }

    if (!response.result || !response.result.paymentLink || !response.result.paymentLink.url) {
      throw new Error('Failed to create Square payment link')
    }

    // メタデータをデータベースに保存（オプション）
    try {
      await supabase
        .from('payment_requests')
        .insert({
          line_id: userId,
          price_id: priceId,
          payment_provider: 'square',
          payment_link_id: response.result.paymentLink.id,
          status: 'pending',
          created_at: new Date().toISOString(),
        })
    } catch (dbError) {
      console.error('Failed to save payment request to database:', dbError)
      // ここではDBエラーがあっても進める
    }

    return NextResponse.json({ 
      checkoutUrl: response.result.paymentLink.url,
      paymentLinkId: response.result.paymentLink.id
    })
  } catch (error) {
    console.error('Square error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Checkout session creation failed: ${errorMessage}` },
      { status: 500 }
    )
  }
} 