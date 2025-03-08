import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabase } from '@/lib/supabase'

const webhookSignatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!

export async function POST(req: Request) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-square-hmacsha256-signature')

    if (!signature) {
      console.error('❌ Missing Square signature')
      return NextResponse.json({ error: 'Missing Square signature' }, { status: 400 })
    }

    // Squareのシグネチャを検証
    const hmac = crypto.createHmac('sha256', webhookSignatureKey)
    hmac.update(body)
    const generatedSignature = hmac.digest('hex')

    if (generatedSignature !== signature) {
      console.error('⚠️ Webhook signature verification failed')
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }

    const event = JSON.parse(body)
    console.log('Square webhook event:', event.type)

    // ここでは支払い通知を受け取るだけのシンプルな実装に簡略化
    // 実際のアプリケーションではイベントタイプに応じた処理を実装
    if (event.type === 'payment.updated' && event.data?.object?.status === 'COMPLETED') {
      // 支払いが完了したことをログに記録
      console.log('Payment completed:', event.data.object.id)
      
      // ここで必要な処理を実装
      // 例：サブスクリプションの有効化、会員ステータスの更新など
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
} 