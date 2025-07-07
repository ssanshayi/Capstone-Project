"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Shield, AlertTriangle } from "lucide-react"

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    // If user loading is complete but not authenticated, redirect to login page
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    // If user is authenticated, check if they are an admin
    if (!isLoading && isAuthenticated && user) {
      setIsAuthorized(user.role === "admin")
    }
  }, [isLoading, isAuthenticated, user, router])

  // Loading state
  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin permissions...</p>
        </div>
      </div>
    )
  }

  // Unauthorized state
  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-red-500">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="mb-4 text-center text-gray-600">
              You do not have permission to access the admin panel. 
              Only users with admin role can access this area.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push("/")}>
                Back to Home
              </Button>
              <Button onClick={() => router.push("/profile")}>
                View Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Authorized - render children
  return <>{children}</>
} 