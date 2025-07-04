"use client"

import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Sidebar } from "@/components/admin/sidebar"
import { AdminHeader } from "@/components/admin/header"

// Admin user ID list - simple verification
const ADMIN_USER_IDS = [
  '86b4f948-471f-45d3-a2a9-24f2375fdc05', // ID from Supabase screenshot
  '1', // Simple ID
  'admin-id-1',
  'admin-id-2'
]

// Admin email list
const ADMIN_EMAILS = [
  'admin@admin.com',
  'admin@example.com'
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [checkingAdmin, setCheckingAdmin] = useState(true)

  useEffect(() => {
    const verifyAdminAccess = async () => {
      if (isLoading) return

      if (!user) {
        router.push('/login')
        return
      }


      // Simple verification: only check if user ID or email is in whitelist
      const isAdminUser = ADMIN_USER_IDS.includes(user.id) || ADMIN_EMAILS.includes(user.email)
      
      if (isAdminUser) {
        setIsAdmin(true)
        setCheckingAdmin(false)
        return
      }

      // If not in whitelist, show permission setup interface
      setIsAdmin(false)
      setCheckingAdmin(false)
    }

    verifyAdminAccess()
  }, [user, isLoading, router])

  // Show loading state
  if (isLoading || checkingAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Verifying permissions...</p>
        </div>
      </div>
    )
  }

  // If no user, redirect to login
  if (!user) {
    return null
  }

  // If not admin, show admin permission setup options
  if (isAdmin === false) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            Current user is not in the admin whitelist.
          </p>
          <div className="bg-gray-100 p-4 rounded mb-4 text-left">
            <p className="text-sm"><strong>Current User:</strong></p>
            <p className="text-sm">ID: {user.id}</p>
            <p className="text-sm">Email: {user.email}</p>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => {
                // Temporarily add current user ID to admin list
                ADMIN_USER_IDS.push(user.id)
                window.location.reload()
              }}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              Add as Admin (Temporary)
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
            >
              Back to Home
            </button>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            <p>Admin Whitelist IDs: {ADMIN_USER_IDS.slice(0, 2).join(', ')}...</p>
            <p>Admin Emails: {ADMIN_EMAILS.join(', ')}</p>
          </div>
        </div>
      </div>
    )
  }

  // If admin, show admin dashboard interface
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}