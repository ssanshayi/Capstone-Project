import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const startTime = Date.now()
    const diagnosticResult: any = {
      timestamp: new Date().toISOString(),
      connection: {
        status: 'unknown' as 'connected' | 'error' | 'unknown',
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'not configured',
        latency: 0,
        error: null as string | null
      },
      tables: {} as Record<string, any>,
      summary: {
        totalTables: 0,
        totalRecords: 0,
        healthyTables: 0,
        errors: [] as string[]
      },
      auth: {
        status: 'unknown' as 'available' | 'error' | 'unknown',
        error: null as string | null
      },
      rls: {
        status: 'unknown' as 'active' | 'error' | 'unknown',
        error: null as string | null
      }
    }

    // 1. 测试基本连接
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key')
        .limit(1)
      
      diagnosticResult.connection.latency = Date.now() - startTime
      
      if (error) {
        diagnosticResult.connection.status = 'error'
        diagnosticResult.connection.error = error.message
        diagnosticResult.summary.errors.push(`连接测试失败: ${error.message}`)
      } else {
        diagnosticResult.connection.status = 'connected'
      }
    } catch (connectionError: any) {
      diagnosticResult.connection.status = 'error'
      diagnosticResult.connection.error = connectionError.message
      diagnosticResult.summary.errors.push(`连接异常: ${connectionError.message}`)
    }

    // 2. 检查各个数据表
    const tables = [
      'profiles',
      'marine_species', 
      'species_tracking',
      'user_favorites',
      'conservation_projects',
      'news_articles',
      'educational_resources',
      'user_activities',
      'system_settings'
    ]

    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .limit(1)

        if (error) {
          diagnosticResult.tables[table] = {
            status: 'error',
            count: 0,
            error: error.message,
            lastChecked: new Date().toISOString()
          }
          diagnosticResult.summary.errors.push(`${table}表检查失败: ${error.message}`)
        } else {
          diagnosticResult.tables[table] = {
            status: 'healthy',
            count: count || 0,
            error: null,
            lastChecked: new Date().toISOString()
          }
          diagnosticResult.summary.healthyTables++
          diagnosticResult.summary.totalRecords += count || 0
        }
      } catch (tableError: any) {
        diagnosticResult.tables[table] = {
          status: 'error',
          count: 0,
          error: tableError.message,
          lastChecked: new Date().toISOString()
        }
        diagnosticResult.summary.errors.push(`${table}表异常: ${tableError.message}`)
      }
    }

    diagnosticResult.summary.totalTables = tables.length

    // 3. 检查认证状态
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser()
      diagnosticResult.auth = {
        status: authError ? 'error' : 'available',
        error: authError?.message || null
      }
    } catch (authException: any) {
      diagnosticResult.auth = {
        status: 'error',
        error: authException.message
      }
    }

    // 4. 检查RLS策略
    try {
      const { data: rlsData, error: rlsError } = await supabase
        .from('marine_species')
        .select('id')
        .limit(1)
      
      diagnosticResult.rls = {
        status: rlsError ? 'error' : 'active',
        error: rlsError?.message || null
      }
    } catch (rlsException: any) {
      diagnosticResult.rls = {
        status: 'error',
        error: rlsException.message
      }
    }

    return NextResponse.json(diagnosticResult)
  } catch (error: any) {
    return NextResponse.json({
      error: 'Diagnostic failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// 测试具体表的详细信息
export async function POST(request: Request) {
  try {
    const { table } = await request.json()
    
    if (!table) {
      return NextResponse.json({ error: 'Table name is required' }, { status: 400 })
    }

    const result = {
      table,
      timestamp: new Date().toISOString(),
      details: {}
    }

    // 获取表的详细统计信息
    const { data, error, count } = await supabase
      .from(table)
      .select('*', { count: 'exact' })
      .limit(5)

    if (error) {
      result.details = {
        status: 'error',
        error: error.message,
        count: 0,
        sampleData: []
      }
    } else {
      result.details = {
        status: 'success',
        count: count || 0,
        sampleData: data || [],
        columns: data && data.length > 0 ? Object.keys(data[0]) : []
      }
    }

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({
      error: 'Table diagnostic failed',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}