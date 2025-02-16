import { NextResponse } from 'next/server'
import liff from '@line/liff'

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json(
        { error: 'IDトークンが必要です' },
        { status: 400 }
      )
    }

    // LIFFのgetDecodedIDTokenを使用してトークンを検証
    const decodedToken = liff.getDecodedIDToken()
    if (!decodedToken) {
      throw new Error('トークンの検証に失敗しました')
    }

    return NextResponse.json({
      userId: decodedToken.sub
    })
  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json(
      { error: 'トークン検証に失敗しました' },
      { status: 401 }
    )
  }
} 