import { supabase } from './supabase'

export async function testSupabaseConnection() {
  try {
    // Log environment variables (without exposing the full key)
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    // Try to fetch a single row from profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Supabase connection error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return false
    }

    console.log('Supabase connection successful!')
    console.log('Connection test data:', data)
    return true
  } catch (error) {
    console.error('Unexpected error testing Supabase connection:', error)
    return false
  }
} 