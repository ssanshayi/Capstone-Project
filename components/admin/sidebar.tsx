"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Users, BarChart3, Settings, Home, Fish, Database, BookOpen } from "lucide-react"
import { Coins } from "lucide-react"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home
  },
  {
    title: "User Management",
    href: "/admin/users",
    icon: Users
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3
  },
  {
    title: "Species Management",
    href: "/admin/species",
    icon: Fish
  },
  {
    title: "Resource Management",
    href: "/admin/resources",
    icon: BookOpen
  },
  {
    title: "Donation Management",               
    href: "/admin/donations",
    icon: Coins                                  
  },
  {
    title: "Database Diagnostic",
    href: "/admin/database-diagnostic",
    icon: Database
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings
  }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Fish className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">Admin Panel</span>
        </Link>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive ? "text-blue-600" : "text-gray-400")} />
                  {item.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Home className="h-5 w-5 text-gray-400" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}