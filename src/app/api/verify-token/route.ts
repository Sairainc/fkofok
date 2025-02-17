import { NextResponse } from 'next/server'
import axios from 'axios'

const LINE_VERIFY_API = 'https://api.line.me/oauth2/v2.1/verify'

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json(
        { error: 'IDトークンが必要です' },
        { status: 400 }
      )
    }

    // LINEプラットフォームでIDトークンを検証
    const response = await axios.get(LINE_VERIFY_API, {
      params: {
        id_token: idToken,
        client_id: process.env.LINE_CLIENT_ID // 修正
      }
    })

    console.log("✅ LINE Verify API Response:", response.data)

    // 検証が成功したらユーザーIDを返す
    const userId = response.data.sub // `sub` がユーザーID
    return NextResponse.json({ userId })

  } catch (error: any) {
    console.error('❌ Token verification error:', error.response?.data || error)
    return NextResponse.json(
      { error: 'トークン検証に失敗しました' },
      { status: 401 }
    )
  }
}
