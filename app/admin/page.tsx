"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function AdminPage() {
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
      
      // Temporary solution: any logged-in user can access admin pages
      setIsAuthorized(true)
      
      // Official solution (uncomment to enable)
      // setIsAuthorized(user.role === "admin")
    }
  }, [isLoading, isAuthenticated, user, router])

  // Loading state
  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Verifying admin permissions...</span>
      </div>
    )
  }

  // Unauthorized state
  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-500">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="mb-4 text-center">You do not have permission to access the admin panel.</p>
            <Button onClick={() => router.push("/")}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin page content
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage system users and permissions</p>
            <Button className="mt-4" onClick={() => router.push("/admin/users")}>
              View Users
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Species Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage marine species data</p>
            <Button className="mt-4" onClick={() => router.push("/admin/species")}>
              View Species
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View system usage statistics and analytics</p>
            <Button className="mt-4" onClick={() => router.push("/admin/analytics")}>
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}