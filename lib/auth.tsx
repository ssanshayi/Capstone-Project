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
        // 直接使用Supabase Auth信息，避免查询profiles表
        const user = session.user
        
        if (user && mounted) {
          setUser({
            id: user.id,
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            email: user.email,
            avatar: user.user_metadata?.avatar_url,
            role: user.user_metadata?.role || 'user', // 默认角色
            joinDate: user.created_at,
            favoriteSpecies: []
          })
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
        if (mounted) setUser(null)
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
      
      // 更新Supabase Auth用户metadata，避免查询profiles表
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: userData.name,
          avatar_url: userData.avatar,
          role: userData.role,
          favorite_species: userData.favoriteSpecies
        }
      })
      
      if (error) throw error
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