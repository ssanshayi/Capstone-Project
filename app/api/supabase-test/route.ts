import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        details: {
          url: supabaseUrl ? 'Found' : 'Missing',
          key: supabaseAnonKey ? 'Found' : 'Missing'
        }
      })
    }

    // Create Supabase client on server side
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Test 1: Basic connection
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    // Test 2: Auth status
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Test 3: Direct fetch test
    let directFetchResult = null
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
        method: 'GET',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json'
        }
      })
      directFetchResult = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText
      }
    } catch (err: any) {
      directFetchResult = {
        success: false,
        error: err.message
      }
    }

    return NextResponse.json({
      success: true,
      tests: {
        environment: {
          url: supabaseUrl.substring(0, 30) + '...',
          key: supabaseAnonKey.substring(0, 30) + '...'
        },
        profiles: {
          success: !profilesError,
          error: profilesError?.message,
          data: profilesData
        },
        auth: {
          success: !authError,
          error: authError?.message,
          user: user ? { id: user.id, email: user.email } : null
        },
        directFetch: directFetchResult
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    })
  }
} 