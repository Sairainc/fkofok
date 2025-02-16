import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            res.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            res.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // セッションがない場合のリダイレクト処理
    if (!session && req.nextUrl.pathname.startsWith('/protected')) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

// 特定のパスのみにミドルウェアを適用
export const config = {
  matcher: ['/protected/:path*']  // /formは除外されていることを確認
} 