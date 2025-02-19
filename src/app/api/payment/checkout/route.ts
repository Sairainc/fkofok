import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: Request) {
  try {
    const { priceId, userId, gender } = await request.json()

    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key is not set')
    }

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

    // 価格IDの検証
    const validPriceIds = {
      men: process.env.NEXT_PUBLIC_STRIPE_MEN_PRICE_ID,
      women: process.env.NEXT_PUBLIC_STRIPE_WOMEN_PRICE_ID,
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/payment/cancel`,
      metadata: {
        userId,
        gender,
      },
    })

    return NextResponse.json({ id: session.id })
  } catch (error) {
    console.error('Stripe error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: `Checkout session creation failed: ${errorMessage}` },
      { status: 500 }
    )
  }
} 