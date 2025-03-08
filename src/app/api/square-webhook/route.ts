import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { square } from '@/lib/square'
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

    switch (event.type) {
      case 'payment.created': {
        const payment = event.data.object
        
        // 決済IDから関連する注文詳細を取得
        const { result: orderResult } = await square.ordersApi.retrieveOrder(payment.order_id)
        
        if (!orderResult || !orderResult.order) {
          throw new Error('Order not found')
        }
        
        const order = orderResult.order
        
        // paymentリクエストデータを検索
        const { data: paymentRequestData } = await supabase
          .from('payment_requests')
          .select('line_id')
          .eq('payment_link_id', order.payment_link_id)
          .single()
          
        const userId = paymentRequestData?.line_id
        
        if (!userId) {
          throw new Error('User ID not found for payment')
        }

        // 🔹 `square_customers` テーブルに保存
        const { error: customerError } = await supabase
          .from('square_customers')
          .upsert(
            {
              line_id: userId,
              square_customer_id: payment.customer_id || null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'line_id' }
          )

        if (customerError) throw customerError

        // 🔹 `payment_history` テーブルに保存
        const { error: paymentError } = await supabase
          .from('payment_history')
          .insert({
            line_id: userId,
            square_customer_id: payment.customer_id || null,
            square_payment_id: payment.id,
            amount: payment.amount_money ? payment.amount_money.amount / 100 : 0,
            currency: payment.amount_money ? payment.amount_money.currency : 'JPY',
            payment_status: payment.status,
            payment_provider: 'square',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (paymentError) throw paymentError

        // 🔹 サブスクリプションステータスの更新
        // Square APIで今後のサブスクリプション詳細を取得する必要があります
        // この例では簡易的に支払い成功時に30日間のサブスクリプションを設定
        const { error: subscriptionError } = await supabase
          .from('subscriptions')
          .insert({
            line_id: userId,
            square_payment_id: payment.id,
            square_customer_id: payment.customer_id || null,
            status: 'active',
            payment_provider: 'square',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

        if (subscriptionError) throw subscriptionError

        break
      }

      case 'subscription.created':
      case 'subscription.updated': {
        // Squareサブスクリプション機能を使用する場合はここに実装
        // 現在のSquareのサブスクリプションAPIの実装に合わせて必要な処理を追加
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
} 