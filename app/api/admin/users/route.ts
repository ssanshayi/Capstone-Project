import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 检查用户认证状态
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.log('Auth error or no user:', authError?.message || 'No user found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('User authenticated:', user.email, 'Role:', user.user_metadata?.role)

    // 检查管理员权限 - 支持多种验证方式
    const isAdmin = user.user_metadata?.role === 'admin' || 
                   user.email === 'admin@admin.com' ||
                   user.email === 'admin@example.com'
    
    if (!isAdmin) {
      console.log('User not admin:', user.email, 'Role:', user.user_metadata?.role)
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    console.log('Admin access granted for:', user.email)

    // 使用Supabase查询用户数据
    const { data: users, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, avatar_url, created_at, is_banned')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      throw error
    }

    console.log('Successfully fetched users:', users?.length || 0)
    return NextResponse.json({ data: users || [] })
  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
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

    const { id, name, role, is_banned } = await request.json()

    // 使用Supabase更新用户数据
    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update({ 
        full_name: name, 
        role: role, 
        is_banned: is_banned 
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database update error:', error)
      throw error
    }

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: updatedUser })
  } catch (error) {
    console.error('Admin users update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}