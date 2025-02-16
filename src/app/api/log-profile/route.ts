import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const profile = await request.json()
    
    // サーバーサイドのターミナルに表示
    console.log('\n=== LINE User Profile ===')
    console.log('User ID:', profile.userId)
    console.log('Display Name:', profile.displayName)
    console.log('Picture URL:', profile.pictureUrl)
    console.log('Status Message:', profile.statusMessage)
    console.log('========================\n')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging profile:', error)
    return NextResponse.json({ error: 'Failed to log profile' }, { status: 500 })
  }
} 