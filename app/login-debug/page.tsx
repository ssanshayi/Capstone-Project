"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"

export default function LoginDebugPage() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [authStatus, setAuthStatus] = useState<string>("Checking...")
  const [error, setError] = useState<string>("")
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    addLog("Checking authentication status...")
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        addLog(`Auth error: ${error.message}`)
        setAuthStatus("Error")
        setError(error.message)
        setCurrentUser(null)
      } else if (user) {
        addLog(`User found: ${user.email}`)
        setAuthStatus("Authenticated")
        setError("")
        setCurrentUser(user)
      } else {
        addLog("No user found")
        setAuthStatus("Not authenticated")
        setError("")
        setCurrentUser(null)
      }
    } catch (err: any) {
      addLog(`Exception: ${err.message}`)
      setAuthStatus("Error")
      setError(err.message)
    }
  }

  const testSignUp = async () => {
    addLog("Testing sign up...")
    try {
      const { data, error } = await supabase.auth.signUp({
        email: "test@example.com",
        password: "test123456",
        options: {
          data: {
            full_name: "Test User",
            role: "user"
          }
        }
      })

      if (error) {
        addLog(`Sign up error: ${error.message}`)
        setError(error.message)
      } else {
        addLog(`Sign up successful: ${data.user?.email}`)
        setCurrentUser(data.user)
        setAuthStatus("Authenticated")
      }
    } catch (err: any) {
      addLog(`Sign up exception: ${err.message}`)
      setError(err.message)
    }
  }

  const testSignIn = async () => {
    addLog("Testing sign in...")
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "test@example.com",
        password: "test123456"
      })

      if (error) {
        addLog(`Sign in error: ${error.message}`)
        setError(error.message)
      } else {
        addLog(`Sign in successful: ${data.user?.email}`)
        setCurrentUser(data.user)
        setAuthStatus("Authenticated")
      }
    } catch (err: any) {
      addLog(`Sign in exception: ${err.message}`)
      setError(err.message)
    }
  }

  const testAdminSignUp = async () => {
    addLog("Testing admin sign up...")
    try {
      const { data, error } = await supabase.auth.signUp({
        email: "admin@admin.com",
        password: "admin123456",
        options: {
          data: {
            full_name: "Admin User",
            role: "admin"
          }
        }
      })

      if (error) {
        addLog(`Admin sign up error: ${error.message}`)
        setError(error.message)
      } else {
        addLog(`Admin sign up successful: ${data.user?.email}`)
        setCurrentUser(data.user)
        setAuthStatus("Authenticated")
      }
    } catch (err: any) {
      addLog(`Admin sign up exception: ${err.message}`)
      setError(err.message)
    }
  }

  const testAdminSignIn = async () => {
    addLog("Testing admin sign in...")
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "admin@admin.com",
        password: "admin123456"
      })

      if (error) {
        addLog(`Admin sign in error: ${error.message}`)
        setError(error.message)
      } else {
        addLog(`Admin sign in successful: ${data.user?.email}`)
        setCurrentUser(data.user)
        setAuthStatus("Authenticated")
      }
    } catch (err: any) {
      addLog(`Admin sign in exception: ${err.message}`)
      setError(err.message)
    }
  }

  const signOut = async () => {
    addLog("Signing out...")
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        addLog(`Sign out error: ${error.message}`)
      } else {
        addLog("Sign out successful")
        setCurrentUser(null)
        setAuthStatus("Not authenticated")
      }
    } catch (err: any) {
      addLog(`Sign out exception: ${err.message}`)
    }
  }

  const checkEnvironment = () => {
    addLog("Checking environment variables...")
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (url && key) {
      addLog("Environment variables found")
      addLog(`URL: ${url.substring(0, 20)}...`)
      addLog(`Key: ${key.substring(0, 20)}...`)
    } else {
      addLog("Missing environment variables!")
      addLog(`URL: ${url ? 'Found' : 'Missing'}`)
      addLog(`Key: ${key ? 'Found' : 'Missing'}`)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Login Debug</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-4">Current Status</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span>Status:</span>
                  {authStatus === "Authenticated" && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {authStatus === "Error" && <XCircle className="h-4 w-4 text-red-500" />}
                  {authStatus === "Not authenticated" && <AlertCircle className="h-4 w-4 text-yellow-500" />}
                  <span className="font-medium">{authStatus}</span>
                </div>
                
                {currentUser && (
                  <div className="p-3 bg-gray-50 rounded">
                    <p><strong>Email:</strong> {currentUser.email}</p>
                    <p><strong>ID:</strong> {currentUser.id}</p>
                    <p><strong>Role:</strong> {currentUser.user_metadata?.role || 'None'}</p>
                    <p><strong>Created:</strong> {new Date(currentUser.created_at).toLocaleString()}</p>
                  </div>
                )}
                
                {error && (
                  <Alert>
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Test Actions</h3>
              <div className="space-y-2">
                <Button onClick={checkEnvironment} variant="outline" className="w-full">
                  Check Environment
                </Button>
                <Button onClick={checkAuthStatus} variant="outline" className="w-full">
                  Refresh Auth Status
                </Button>
                <Button onClick={testSignUp} variant="outline" className="w-full">
                  Test Sign Up
                </Button>
                <Button onClick={testSignIn} variant="outline" className="w-full">
                  Test Sign In
                </Button>
                <Button onClick={testAdminSignUp} className="w-full">
                  Admin Sign Up
                </Button>
                <Button onClick={testAdminSignIn} className="w-full">
                  Admin Sign In
                </Button>
                {currentUser && (
                  <Button onClick={signOut} variant="destructive" className="w-full">
                    Sign Out
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Debug Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
            {logs.length === 0 && <div>No logs yet...</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 