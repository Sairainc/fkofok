import { NextResponse } from 'next/server'

// POST メソッドを明示的に export する
export const POST = async (request: Request) => {
  try {
    const logData = await request.json()
    
    // サーバーサイドのターミナルに表示
    console.log('\n=== LINE Login Log ===')
    console.log('Timestamp:', new Date().toISOString())
    console.log('Event:', logData.event)

    // イベントタイプに応じて詳細情報を表示
    switch (logData.event) {
      case 'LINE_PROFILE_FETCH':
      case 'LIFF_PROFILE_FETCH_SUCCESS':
        console.log('\nUser Profile:')
        console.log('└── User ID:', logData.details.userId)
        console.log('└── Display Name:', logData.details.displayName)
        console.log('└── Picture URL:', logData.details.pictureUrl)
        console.log('└── Status Message:', logData.details.statusMessage)
        break

      case 'LIFF_LOGIN_STATUS':
        console.log('Login Status:', logData.details.isLoggedIn ? 'Logged In' : 'Not Logged In')
        break

      case 'SUPABASE_SAVE_START':
        console.log('\nSaving User Data:')
        console.log('└── LINE ID:', logData.details.line_user_id)
        console.log('└── Display Name:', logData.details.display_name)
        console.log('└── Profile Picture:', logData.details.profile_picture)
        console.log('└── Updated At:', logData.details.updated_at)
        break

      case 'SUPABASE_SAVE_SUCCESS':
        console.log('\nSaved User Data:')
        console.log(JSON.stringify(logData.details.data, null, 2))
        break

      case 'SUPABASE_SAVE_ERROR':
        console.log('\nDatabase Error:')
        console.log('└── Code:', logData.details.code)
        console.log('└── Message:', logData.details.message)
        console.log('└── Details:', logData.details.details)
        break

      default:
        console.log('Details:', logData.details)
    }

    console.log('\n=====================')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging LINE login:', error)
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 })
  }
} 