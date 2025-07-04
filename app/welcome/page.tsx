"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function WelcomePage() {
  const [text, setText] = useState("")
  const fullText = "Welcome to Marine Eyes"
  const router = useRouter()

  useEffect(() => {
    let i = 0
    const typing = setInterval(() => {
      setText(fullText.slice(0, i + 1))
      i++
      if (i === fullText.length) {
        clearInterval(typing)
        setTimeout(() => router.push("/"), 2000)
      }
    }, 100)

    return () => clearInterval(typing)
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-800 to-teal-700">
      <h1 className="text-white text-3xl md:text-5xl font-mono">
        {text}
        <span className="border-r-2 border-white animate-blink ml-1" />
      </h1>
    </div>
  )
}
