import type { Metadata } from "next"
import { Montserrat, Lora } from "next/font/google"
import "./globals.css"
import AuthWrapper from "@/components/auth-wrapper"
import { Toaster } from "@/components/ui/toaster"

const montserrat = Montserrat({ subsets: ["latin"], display: "swap", variable: "--font-montserrat" })
const lora = Lora({ subsets: ["latin"], display: "swap", variable: "--font-lora" })

export const metadata: Metadata = {
  title: "Marine Species Tracker",
  description: "Track and learn about marine species around the world",
  generator: "v0.dev",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${lora.variable}`}>
      <body className="font-sans">
        <AuthWrapper>{children}</AuthWrapper>
        <Toaster />
      </body>
    </html>
  )
}
