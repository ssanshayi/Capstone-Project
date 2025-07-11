import { createClient } from '@supabase/supabase-js'

// Ensure your environment variables are loaded
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("  Missing Supabase environment variables!")
  console.error("  Ensure you have a .env.local file with:")
  console.error("   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url")
  console.error("   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key")
  console.error(" Get these from: https://supabase.com/dashboard > Project > Settings > API")
}

export const supabase = createClient(
  supabaseUrl || 'https://dummy.supabase.co',
  supabaseAnonKey || 'dummy-key'
)
