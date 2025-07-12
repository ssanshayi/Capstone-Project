"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Fish, BarChart3, FileText, Database, Settings } from "lucide-react"
import { Coins } from "lucide-react"

export default function AdminPage() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage your marine conservation platform</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <CardTitle>User Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Manage system users, roles, and permissions</p>
            <Button className="w-full" onClick={() => router.push("/admin/users")}>
              View Users
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Fish className="h-5 w-5 text-green-600" />
              <CardTitle>Species Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Manage marine species data and information</p>
            <Button className="w-full" onClick={() => router.push("/admin/species")}>
              View Species
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <CardTitle>Resource Management</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Manage educational resources and materials</p>
            <Button className="w-full" onClick={() => router.push("/admin/resources")}>
              View Resources
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              <CardTitle>System Analytics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">View system usage statistics and analytics</p>
            <Button className="w-full" onClick={() => router.push("/admin/analytics")}>
              View Analytics
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
         <CardHeader>
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-600" />
            <CardTitle>Donation Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">View and manage donation records</p>
          <Button className="w-full" onClick={() => router.push("/admin/donations")}>
            View Donations
          </Button>
        </CardContent>
      </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-red-600" />
              <CardTitle>Database Diagnostic</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Monitor database health and performance</p>
            <Button className="w-full" onClick={() => router.push("/admin/database-diagnostic")}>
              Run Diagnostics
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              <CardTitle>System Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Configure system settings and preferences</p>
            <Button className="w-full" onClick={() => router.push("/admin/settings")}>
              View Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}