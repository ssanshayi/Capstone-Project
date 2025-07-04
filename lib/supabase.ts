import { createClient } from '@supabase/supabase-js'

// 直接使用Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('缺少Supabase环境变量，请检查.env.local文件')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 