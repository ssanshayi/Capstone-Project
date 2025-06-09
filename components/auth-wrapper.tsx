"use client"

import { ReactNode } from "react"
import AuthProvider from "@/components/auth-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function AuthWrapper({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
