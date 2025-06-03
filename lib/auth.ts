"use client"

import * as React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "./supabase"
import type { User as SupabaseUser } from '@supabase/supabase-js'

// Define user type
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "user" | "researcher"
  joinDate: string
  favoriteSpecies: string[]
}

// Define auth context type
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (userData: Partial<User>) => Promise<boolean>
}

// Create auth context
const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (profile) {
            setUser({
              id: profile.id,
              name: profile.name,
              email: profile.email,
              avatar: profile.avatar_url,
              role: profile.role,
              joinDate: profile.created_at,
              favoriteSpecies: profile.favorite_species || []
            })
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          setUser({
            id: profile.id,
            name: profile.name,
            email: profile.email,
            avatar: profile.avatar_url,
            role: profile.role,
            joinDate: profile.created_at,
            favoriteSpecies: profile.favorite_species || []
          })
        }
      } else {
        setUser(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error logging in:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      })
      if (authError) throw authError
      return true
    } catch (error) {
      console.error('Error registering:', error, JSON.stringify(error, Object.getOwnPropertyNames(error)))
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  // Update user function
  const updateUser = async (userData: Partial<User>): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      if (!user) return false

      const { error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          avatar_url: userData.avatar,
          role: userData.role,
          favorite_species: userData.favoriteSpecies
        })
        .eq('id', user.id)

      if (error) throw error

      // Update local state
      setUser(prev => prev ? { ...prev, ...userData } : null)
      return true
    } catch (error) {
      console.error('Error updating user:', error)
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

  return React.createElement(AuthContext.Provider, { value: contextValue }, children)
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
