"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "../lib/auth"
import { Button } from "@/components/ui/button"

export default function ExploreButton() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const handleClick = () => {
    if (isAuthenticated) {
      router.push("/")
    } else {
      router.push("/")
    }
  }

  return (
    <Button
      onClick={handleClick}
      className="bg-[#0056b3] hover:bg-[#003f80] text-white px-8 py-3 text-lg"
    >
      Explore Now!
    </Button>
  )
}
