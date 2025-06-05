"use client"
import { AuthProvider as RealProvider } from "@/lib/auth"

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <RealProvider>{children}</RealProvider>
}
