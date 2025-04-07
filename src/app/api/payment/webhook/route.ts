import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, data } = body

    // 決済完了イベントのみを処理
    if (type === 'payment.created') {
      const { 
        id: payment_intent_id,
        amount_money,
        customer_id,
        payment_method_id
      } = data.object

      // ユーザー情報を取得
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('line_id')
        .eq('square_customer_id', customer_id)
        .single()

      if (userError || !userData) {
        console.error('User not found:', userError)
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // 決済記録を保存
      const { error: paymentError } = await supabase
        .from('payment_history')
        .insert({
          line_id: userData.line_id,
          square_customer_id: customer_id,
          amount: amount_money.amount,
          currency: amount_money.currency,
          payment_status: 'completed',
          payment_intent_id: payment_intent_id,
          payment_method_id: payment_method_id
        })

      if (paymentError) {
        console.error('Failed to save payment record:', paymentError)
        return NextResponse.json({ error: 'Failed to save payment record' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 