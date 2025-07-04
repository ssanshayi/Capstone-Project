import { supabase } from './supabase'

// Get user favorites list
export async function getUserFavorites(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        id,
        species_id,
        created_at,
        marine_species (
          id,
          name,
          scientific_name,
          category,
          conservation_status,
          description,
          image_url,
          tags,
          population_trend,
          population_percentage
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching favorites:', error)
      return { favorites: [], error: error.message }
    }

    return { favorites: data || [], error: null }
  } catch (error) {
    console.error('Error in getUserFavorites:', error)
    return { favorites: [], error: 'Failed to fetch favorites' }
  }
}

// Check if species is favorited
export async function isSpeciesFavorited(userId: string, speciesId: string) {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('species_id', speciesId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking favorite status:', error)
      return { isFavorited: false, error: error.message }
    }

    return { isFavorited: !!data, error: null }
  } catch (error) {
    console.error('Error in isSpeciesFavorited:', error)
    return { isFavorited: false, error: 'Failed to check favorite status' }
  }
}

// Add to favorites
export async function addToFavorites(userId: string, speciesId: string) {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .insert([
        {
          user_id: userId,
          species_id: speciesId
        }
      ])
      .select()

    if (error) {
      // 处理重复收藏的情况
      if (error.code === '23505') { // unique constraint violation
        return { success: false, error: 'Species already in favorites list' }
      }
      console.error('Error adding to favorites:', error)
      return { success: false, error: error.message }
    }

    // Record user activity
    await supabase
      .from('user_activities')
      .insert([
        {
          user_id: userId,
          activity_type: 'species_favorite',
          activity_data: JSON.stringify({ species_id: speciesId }),
          ip_address: '127.0.0.1',
          user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'
        }
      ])

    return { success: true, data: data[0], error: null }
  } catch (error) {
    console.error('Error in addToFavorites:', error)
    return { success: false, error: 'Failed to add to favorites' }
  }
}

// Remove from favorites
export async function removeFromFavorites(userId: string, speciesId: string) {
  try {
    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('species_id', speciesId)

    if (error) {
      console.error('Error removing from favorites:', error)
      return { success: false, error: error.message }
    }

    // Record user activity
    await supabase
      .from('user_activities')
      .insert([
        {
          user_id: userId,
          activity_type: 'species_unfavorite',
          activity_data: JSON.stringify({ species_id: speciesId }),
          ip_address: '127.0.0.1',
          user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server'
        }
      ])

    return { success: true, error: null }
  } catch (error) {
    console.error('Error in removeFromFavorites:', error)
    return { success: false, error: 'Failed to remove from favorites' }
  }
}

// Toggle favorite status
export async function toggleFavorite(userId: string, speciesId: string) {
  try {
    const { isFavorited, error: checkError } = await isSpeciesFavorited(userId, speciesId)
    
    if (checkError) {
      return { success: false, error: checkError }
    }

    if (isFavorited) {
      return await removeFromFavorites(userId, speciesId)
    } else {
      return await addToFavorites(userId, speciesId)
    }
  } catch (error) {
    console.error('Error in toggleFavorite:', error)
    return { success: false, error: 'Failed to toggle favorite' }
  }
}