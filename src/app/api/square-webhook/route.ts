import { NextResponse } from 'next/server'
import { handleSquareWebhook } from '@/lib/square'

export async function POST(request: Request) {
  try {
    const event = await request.json()
    await handleSquareWebhook(event)
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
} 