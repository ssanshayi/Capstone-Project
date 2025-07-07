import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // 检查用户认证状态
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 检查管理员权限 - 支持多种验证方式
    const isAdmin = user.user_metadata?.role === 'admin' || 
                   user.email === 'admin@admin.com' ||
                   user.email === 'admin@example.com'
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // 使用Supabase查询统计数据
    const [usersResult, trackingResult] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('species_tracking').select('*', { count: 'exact', head: true })
    ])

    if (usersResult.error) {
      console.error('Users count error:', usersResult.error)
      throw usersResult.error
    }

    if (trackingResult.error) {
      console.error('Tracking count error:', trackingResult.error)
      throw trackingResult.error
    }

    return NextResponse.json({
      userCount: usersResult.count || 0,
      trackingCount: trackingResult.count || 0
    })
  } catch (error) {
    console.error('Admin stats API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}