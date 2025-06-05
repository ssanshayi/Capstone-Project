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
  role: "user" | "researcher"
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return true
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
        options: { data: { name } }
      })
      if (authError) return authError.message
      if (!authData?.user) return "Signup failed: no user returned"

      await supabase.from("profiles").insert({
        id: authData.user.id,
        email,
        name,
        role: "user",
        created_at: new Date().toISOString(),
        favorite_species: []
      })
      return null
    } catch (error: any) {
      return error.message || "Unknown registration error"
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
      const { error } = await supabase
        .from("profiles")
        .update({
          name: userData.name,
          avatar_url: userData.avatar,
          role: userData.role,
          favorite_species: userData.favoriteSpecies
        })
        .eq("id", user.id)
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