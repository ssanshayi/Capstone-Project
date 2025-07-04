"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Home from "../components/homepage" 

export default function HomePageWrapper() {
  const [showContent, setShowContent] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const visited = sessionStorage.getItem("visited")
    if (!visited) {
      sessionStorage.setItem("visited", "true")
      router.replace("/welcome")
    } else {
      setShowContent(true)
    }
  }, [router])

  return showContent ? <Home /> : null
}
