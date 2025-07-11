"use client"

import { ReactNode } from "react"
import AuthProvider from "@/components/auth-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { usePathname } from "next/navigation"

export default function AuthWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isWelcomePage = pathname.startsWith("/welcome")

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        {!isWelcomePage && <Navbar />}
        <main className="flex-1">{children}</main>
        {!isWelcomePage && <Footer />}
      </div>
    </AuthProvider>
  )
}
