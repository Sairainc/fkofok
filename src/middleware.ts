import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function middleware(req: NextRequest) {
  try {
    const supabase = createMiddlewareClient<Database>({
      req,
      res: NextResponse.next(),
    })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // セッションがない場合のリダイレクト処理
    if (!session && req.nextUrl.pathname.startsWith('/protected')) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

// 特定のパスのみにミドルウェアを適用
export const config = {
  matcher: ['/protected/:path*']  // /formは除外されていることを確認
} 