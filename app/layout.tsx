import type React from "react"
import type { Metadata } from "next"
import { Montserrat, Lora } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import AuthProvider from "@/components/auth-provider"

// Define fonts
const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
})

const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-lora",
})

export const metadata: Metadata = {
  title: "Marine Species Tracker",
  description: "Track and learn about marine species around the world",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${lora.variable}`}>
      <body className="font-sans">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
