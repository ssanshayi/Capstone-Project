import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 管理员用户ID列表 - 与admin layout保持一致
const ADMIN_USER_IDS = [
  '86b4f948-471f-45d3-a2a9-24f2375fdc05',
  '1',
  'admin-id-1',
  'admin-id-2'
]

const ADMIN_EMAILS = [
  'admin@admin.com',
  'admin@example.com'
]

export async function middleware(req: NextRequest) {
  // 只对admin路由进行拦截
  if (!req.nextUrl.pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    // 检查用户登录状态
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      console.log('🚫 Middleware: 用户未登录，重定向到登录页')
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // 使用相同的ID验证逻辑
    const isAdminUser = ADMIN_USER_IDS.includes(user.id) || ADMIN_EMAILS.includes(user.email || '')
    
    if (!isAdminUser) {
      console.log('🚫 Middleware: 用户不在管理员白名单中', {
        userId: user.id,
        email: user.email
      })
      // 重定向到主页而不是登录页，让用户看到权限设置界面
      return NextResponse.redirect(new URL('/', req.url))
    }

    console.log('✅ Middleware: 管理员验证通过', {
      email: user.email,
      userId: user.id,
      path: req.nextUrl.pathname
    })

    // 管理员用户，允许访问
    return res
  } catch (error) {
    console.error('🚨 Middleware error:', error)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: [
    // 暂时禁用admin路由的middleware拦截，让页面组件处理权限验证
    // '/admin/:path*',
  ],
}