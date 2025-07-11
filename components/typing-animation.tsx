"use client"

import { useEffect, useState } from "react"

interface TypingAnimationProps {
  text: string
  speed?: number
}

export const TypingAnimation = ({ text, speed = 50 }: TypingAnimationProps) => {
  const [displayedText, setDisplayedText] = useState("")

  useEffect(() => {
    let index = 0
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text[index])
      index++
      if (index === text.length) clearInterval(timer)
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  return <p className="mb-6 text-lg text-white">{displayedText}</p>
}
