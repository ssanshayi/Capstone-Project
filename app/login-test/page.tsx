"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginTestPage() {
  const [email, setEmail] = useState("admin@admin.com")
  const [password, setPassword] = useState("admin123456")
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()

  // Check current auth status on load
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (data.user) {
        toast.success("Login successful!")
        console.log("User data:", data.user)
        console.log("User metadata:", data.user.user_metadata)
        
        // Check if user is admin
        const isAdmin = data.user.user_metadata?.role === 'admin' || 
                       data.user.email === 'admin@admin.com' ||
                       data.user.email === 'admin@example.com'
        
        if (isAdmin) {
          toast.success("Admin access confirmed!")
          setCurrentUser(data.user)
          setTimeout(() => router.push("/admin"), 1000)
        } else {
          toast.warning("User logged in but not admin. Check user metadata.")
          setCurrentUser(data.user)
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async () => {
    setIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: "Admin User",
            role: "admin" // This will be stored in user_metadata
          }
        }
      })

      if (error) {
        toast.error(error.message)
        return
      }

      if (data.user) {
        toast.success("Registration successful! Please check your email to confirm.")
        console.log("Registered user:", data.user)
        
        // For development, you might want to auto-confirm
        if (data.user.email_confirmed_at) {
          toast.success("Email confirmed! You can now log in.")
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast.success("Logged out successfully")
      setCurrentUser(null)
    } catch (error: any) {
      toast.error(error.message || "Logout failed")
    }
  }

  const handleQuickAdmin = async () => {
    setIsLoading(true)
    
    try {
      // Try to sign up with admin credentials
      const { data, error } = await supabase.auth.signUp({
        email: "admin@admin.com",
        password: "admin123456",
        options: {
          data: {
            full_name: "Quick Admin",
            role: "admin"
          }
        }
      })

      if (error) {
        // If user exists, try to sign in
        if (error.message.includes('already registered')) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: "admin@admin.com",
            password: "admin123456"
          })

          if (signInError) {
            toast.error("Login failed: " + signInError.message)
            return
          }

          if (signInData.user) {
            toast.success("Quick admin login successful!")
            setCurrentUser(signInData.user)
            setTimeout(() => router.push("/admin"), 1000)
          }
        } else {
          toast.error(error.message)
        }
      } else {
        toast.success("Quick admin account created! You can now log in.")
      }
    } catch (error: any) {
      toast.error(error.message || "Quick admin setup failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md p-6">
      <Card>
        <CardHeader>
          <CardTitle>Login Test</CardTitle>
        </CardHeader>
        <CardContent>
          {currentUser ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Logged in as:</strong> {currentUser.email}
                  <br />
                  <strong>Role:</strong> {currentUser.user_metadata?.role || 'None'}
                </AlertDescription>
              </Alert>
              
              <div className="flex gap-2">
                <Button onClick={() => router.push("/admin")} className="flex-1">
                  Go to Admin
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@admin.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleRegister}
                    disabled={isLoading}
                  >
                    Register
                  </Button>
                </div>
              </form>

              <div className="pt-4 border-t">
                <Button 
                  onClick={handleQuickAdmin}
                  disabled={isLoading}
                  className="w-full mb-4"
                  variant="secondary"
                >
                  Quick Admin Setup
                </Button>
              </div>

              <div className="p-3 bg-gray-50 rounded">
                <h4 className="font-medium mb-2">Test Accounts:</h4>
                <ul className="text-sm space-y-1">
                  <li>• admin@admin.com (auto admin)</li>
                  <li>• admin@example.com (auto admin)</li>
                  <li>• Any email with role: "admin" in metadata</li>
                </ul>
                <p className="text-xs text-gray-600 mt-2">
                  Use "Quick Admin Setup" to create/login with admin@admin.com
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 