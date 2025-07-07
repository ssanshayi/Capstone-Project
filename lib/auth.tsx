"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "./supabase"
import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "user" | "researcher" | "admin"
  joinDate: string
  favoriteSpecies: string[]
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<string | null>
  logout: () => void
  updateUser: (userData: Partial<User>) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadUserProfile = async (session: any) => {
      if (!session?.user) {
        if (mounted) setUser(null)
        return
      }

      try {
        const user = session.user
        
        // Try to fetch user profile from profiles table, but don't fail if it doesn't exist
        let profile = null
        try {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role, full_name, avatar_url')
            .eq('id', user.id)
            .maybeSingle() // Use maybeSingle instead of single to avoid errors

          if (profileError) {
            console.log('Profile fetch error:', profileError.message)
          } else {
            profile = profileData
          }
        } catch (profileFetchError) {
          console.log('Profile fetch failed:', profileFetchError)
        }

        if (user && mounted) {
          // If no profile exists, create one
          if (!profile && user.email) {
            try {
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert([{
                  id: user.id,
                  email: user.email,
                  full_name: (user as any).user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                  role: 'user', // Default to user role
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }])
                .select()
                .single()

              if (!createError && newProfile) {
                profile = newProfile
                console.log('Created new profile for user:', newProfile)
              }
            } catch (createProfileError) {
              console.log('Failed to create profile:', createProfileError)
            }
          }

          setUser({
            id: user.id,
            name: profile?.full_name || (user as any).user_metadata?.full_name || (user as any).user_metadata?.name || user.email?.split('@')[0] || 'User',
            email: user.email,
            avatar: profile?.avatar_url || (user as any).user_metadata?.avatar_url,
            role: profile?.role || (user as any).user_metadata?.role || 'user', // Use profile role first, fallback to metadata
            joinDate: (user as any).created_at,
            favoriteSpecies: []
          })
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
        // Don't set user to null on error, just use auth data
        if (user && mounted) {
          setUser({
            id: user.id,
            name: (user as any).user_metadata?.full_name || (user as any).user_metadata?.name || user.email?.split('@')[0] || 'User',
            email: user.email,
            avatar: (user as any).user_metadata?.avatar_url,
            role: (user as any).user_metadata?.role || 'user',
            joinDate: (user as any).created_at,
            favoriteSpecies: []
          })
        }
      }
    }

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        await loadUserProfile(session)
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        if (mounted) setIsLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      // Auth state changed
      await loadUserProfile(session)
      if (mounted) setIsLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        console.error("Login error:", error)
        return false
      }
      
      if (data.user && data.session) {
        // 认证状态会通过 onAuthStateChange 自动更新
        return true
      }
      
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string): Promise<string | null> => {
    try {
      setIsLoading(true)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { 
            full_name: name 
          }
        }
      })
      
      if (authError) return authError.message
      if (!authData?.user) return "Signup failed: no user returned"
      
      return null
    } catch (error: any) {
      return (error as any)?.message || "Unknown registration error"
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      setIsLoading(true)
      if (!user) return false
      
      // Update both auth metadata and profiles table
      const updatePromises = []
      
      // Update auth metadata
      if (userData.name || userData.avatar || userData.role || userData.favoriteSpecies) {
        updatePromises.push(
          supabase.auth.updateUser({
            data: {
              full_name: userData.name,
              avatar_url: userData.avatar,
              role: userData.role,
              favorite_species: userData.favoriteSpecies
            }
          })
        )
      }
      
      // Update profiles table
      if (userData.name || userData.avatar || userData.role) {
        const profileUpdates: any = {}
        if (userData.name) profileUpdates.full_name = userData.name
        if (userData.avatar) profileUpdates.avatar_url = userData.avatar
        if (userData.role) profileUpdates.role = userData.role
        
        updatePromises.push(
          supabase
            .from('profiles')
            .update(profileUpdates)
            .eq('id', user.id)
        )
      }
      
      // Wait for all updates to complete
      const results = await Promise.all(updatePromises)
      
      // Check for errors
      for (const result of results) {
        if (result.error) throw result.error
      }
      
      setUser(prev => prev ? { ...prev, ...userData } : null)
      return true
    } catch (error) {
      console.error("Update user error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}