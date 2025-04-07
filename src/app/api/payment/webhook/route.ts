import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// SquareのWebhook署名を検証
function verifySquareWebhook(signature: string, payload: string, webhookUrl: string): boolean {
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY || ''
  const hmac = crypto.createHmac('sha256', signatureKey)
  hmac.update(webhookUrl + payload)
  const expectedSignature = hmac.digest('base64')
  return signature === expectedSignature
}

export async function POST(request: Request) {
  try {
    // リクエストの詳細をログに記録
    console.log('Webhook received:', {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries())
    })

    const signature = request.headers.get('x-square-hmacsha256-signature')
    const webhookUrl = request.url
    const body = await request.text()
    
    // リクエストボディをログに記録
    console.log('Webhook body:', body)
    
    // 署名の検証（テスト時はスキップ）
    if (process.env.NODE_ENV !== 'development') {
      if (!signature || !verifySquareWebhook(signature, body, webhookUrl)) {
        console.error('Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    const data = JSON.parse(body)
    const { type, data: eventData } = data

    // 決済完了イベントのみを処理
    if (type === 'payment.created') {
      const payment = eventData.object.payment
      const { 
        id: payment_intent_id,
        amount_money,
        location_id,
        order_id,
        status
      } = payment

      console.log('Payment received:', {
        payment_intent_id,
        amount_money,
        location_id,
        order_id,
        status
      })

      // テスト用の顧客IDを使用（実際の環境では適切な顧客IDを設定）
      const testCustomerId = 'test_customer_123'

      // 決済記録を保存
      const { error: paymentError } = await supabase
        .from('payment_history')
        .insert({
          line_id: testCustomerId, // テスト用
          square_customer_id: testCustomerId, // テスト用
          amount: amount_money.amount,
          currency: amount_money.currency,
          payment_status: status.toLowerCase(),
          payment_intent_id: payment_intent_id,
          payment_method_id: 'test_payment_method' // テスト用
        })

      if (paymentError) {
        console.error('Failed to save payment record:', paymentError)
        return NextResponse.json({ error: 'Failed to save payment record' }, { status: 500 })
      }

      console.log('Payment record saved successfully')
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 