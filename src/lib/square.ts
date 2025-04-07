// Square決済リンクへのアクセスを提供する単純なユーティリティ
// 注: 決済リンクだけを使用するので、Square SDKは必要ありません

import { supabase } from './supabase'
import { createPaymentLink } from './square-client'
import { v4 as uuidv4 } from 'uuid'

export const getSquarePaymentLink = (gender: 'men' | 'women', liffId?: string) => {
  const baseUrl = gender === 'men'
    ? process.env.NEXT_PUBLIC_SQUARE_MEN_PAYMENT_LINK || ''
    : process.env.NEXT_PUBLIC_SQUARE_WOMEN_PAYMENT_LINK || '';

  // LIFF IDが提供されている場合、Deep Linkとして返す
  if (liffId) {
    return `https://liff.line.me/${liffId}/payment/${gender}`;
  }

  return baseUrl;
};

type PaymentType = 'subscription' | 'one_time'

export const createSquarePayment = async (
  lineId: string,
  amount: number,
  paymentType: PaymentType,
  planId: string
) => {
  try {
    const orderId = uuidv4()

    // 支払いリクエストをDBに保存
    const { data: paymentRequest, error: dbError } = await supabase
      .from('payment_requests')
      .insert({
        id: orderId,
        line_id: lineId,
        amount,
        status: 'pending',
        payment_provider: 'square',
        payment_type: paymentType,
        plan_id: planId,
      })
      .select()
      .single()

    if (dbError) throw dbError

    // Squareの支払いリンクを生成
    const paymentUrl = await createPaymentLink(
      amount,
      orderId,
      paymentType === 'subscription'
    )

    return {
      paymentRequest,
      paymentUrl,
    }
  } catch (error) {
    console.error('Failed to create Square payment:', error)
    throw error
  }
}

export const handleSquareWebhook = async (event: any) => {
  try {
    if (event.type === 'payment.updated' && event.data?.object?.status === 'COMPLETED') {
      const paymentId = event.data.object.id
      const amount = event.data.object.amount_money.amount
      const paymentType = event.data.object.payment_type || 'one_time'
      const planId = event.data.object.plan_id

      // 支払いリクエストを更新
      const { data: paymentRequest, error: updateError } = await supabase
        .from('payment_requests')
        .update({
          status: 'completed',
          payment_id: paymentId,
          updated_at: new Date().toISOString(),
        })
        .eq('payment_id', paymentId)
        .select()
        .single()

      if (updateError) throw updateError

      // 支払い履歴に記録
      const { error: historyError } = await supabase
        .from('payment_history')
        .insert({
          line_id: paymentRequest.line_id,
          amount,
          status: 'completed',
          payment_provider: 'square',
          payment_id: paymentId,
          payment_type: paymentType,
          plan_id: planId,
        })

      if (historyError) throw historyError

      return { success: true }
    }
  } catch (error) {
    console.error('Failed to handle Square webhook:', error)
    throw error
  }
} 