import { supabase } from "./supabase"

/**
 * Sync admin role from profiles table to auth metadata
 * This function helps fix the issue where admin role exists in profiles but not in auth metadata
 */
export async function syncAdminRole(email: string): Promise<boolean> {
  try {
    console.log(`Syncing admin role for: ${email}`)
    
    // First, get the user from auth
    const { data: { user }, error: authError } = await supabase.auth.admin.getUserByEmail(email)
    
    if (authError || !user) {
      console.error('User not found in auth:', authError)
      return false
    }
    
    // Get the profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, full_name, avatar_url')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error('Profile not found:', profileError)
      return false
    }
    
    console.log(`Current profile role: ${profile.role}`)
    
    // Update auth metadata with profile data
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: profile.role
      }
    })
    
    if (updateError) {
      console.error('Failed to update auth metadata:', updateError)
      return false
    }
    
    console.log(`✅ Successfully synced admin role for ${email}`)
    return true
    
  } catch (error) {
    console.error('Error syncing admin role:', error)
    return false
  }
}

/**
 * Sync all admin users from profiles table to auth metadata
 */
export async function syncAllAdminRoles(): Promise<{ success: number; failed: number }> {
  try {
    console.log('Syncing all admin roles...')
    
    // Get all admin users from profiles
    const { data: adminProfiles, error } = await supabase
      .from('profiles')
      .select('id, email, role, full_name, avatar_url')
      .eq('role', 'admin')
    
    if (error) {
      console.error('Failed to fetch admin profiles:', error)
      return { success: 0, failed: 0 }
    }
    
    console.log(`Found ${adminProfiles.length} admin users`)
    
    let success = 0
    let failed = 0
    
    for (const profile of adminProfiles) {
      try {
        // Update auth metadata for each admin user
        const { error: updateError } = await supabase.auth.admin.updateUserById(profile.id, {
          user_metadata: {
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            role: profile.role
          }
        })
        
        if (updateError) {
          console.error(`Failed to sync ${profile.email}:`, updateError)
          failed++
        } else {
          console.log(`✅ Synced admin role for ${profile.email}`)
          success++
        }
      } catch (error) {
        console.error(`Error syncing ${profile.email}:`, error)
        failed++
      }
    }
    
    console.log(`Sync complete: ${success} successful, ${failed} failed`)
    return { success, failed }
    
  } catch (error) {
    console.error('Error syncing all admin roles:', error)
    return { success: 0, failed: 0 }
  }
} 