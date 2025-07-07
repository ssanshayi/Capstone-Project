import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 检查用户认证状态
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('Auth error:', authError.message)
      return NextResponse.json({
        authenticated: false,
        error: authError.message,
        user: null
      })
    }

    if (!user) {
      console.log('No user found')
      return NextResponse.json({
        authenticated: false,
        error: 'No user found',
        user: null
      })
    }

    console.log('User found:', user.email, 'Role:', user.user_metadata?.role)
    
    return NextResponse.json({
      authenticated: true,
      error: null,
      user: {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role,
        metadata: user.user_metadata
      }
    })
  } catch (error) {
    console.error('Test auth API error:', error)
    return NextResponse.json({
      authenticated: false,
      error: 'Internal server error',
      user: null
    })
  }
} 