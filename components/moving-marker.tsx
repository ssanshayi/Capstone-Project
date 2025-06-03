"use client"

import { useEffect, useState, useRef } from "react"
import dynamic from "next/dynamic"
import { Icon, DivIcon } from "leaflet"
import type { MarineSpecies } from "@/lib/data"
import { createColoredMarker } from "@/lib/icons"

const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false })

interface MovingMarkerProps {
  species: MarineSpecies
  onClick: () => void
}

export default function MovingMarker({ species, onClick }: MovingMarkerProps) {
  const [position, setPosition] = useState(species.startPosition)
  const animationRef = useRef<number | null>(null)
  const speedFactor = 0.0001 // Controls movement speed

  // Determine species type for icon
  const getSpeciesType = () => {
    if (species.tags.includes("Shark") || species.name.toLowerCase().includes("shark")) {
      return "shark"
    } else if (species.tags.includes("Whale") || species.name.toLowerCase().includes("whale")) {
      return "whale"
    } else if (species.tags.includes("Turtle") || species.name.toLowerCase().includes("turtle")) {
      return "turtle"
    } else if (species.tags.includes("Ray") || species.name.toLowerCase().includes("ray")) {
      return "ray"
    } else if (
      species.tags.includes("Dolphin") ||
      species.name.toLowerCase().includes("dolphin") ||
      species.name.toLowerCase().includes("orca")
    ) {
      return "dolphin"
    } else {
      return "fish"
    }
  }

  // Create a custom HTML marker
  const createHtmlMarker = () => {
    const speciesType = getSpeciesType()
    let color = "#3b82f6" // Default blue
    let emoji = "🐠" // Default fish

    if (speciesType === "shark") {
      color = "#ef4444" // Red
      emoji = "🦈"
    } else if (speciesType === "whale") {
      color = "#3b82f6" // Blue
      emoji = "🐋"
    } else if (speciesType === "turtle") {
      color = "#10b981" // Green
      emoji = "🐢"
    } else if (speciesType === "ray") {
      color = "#8b5cf6" // Purple
      emoji = "🐡"
    } else if (speciesType === "dolphin") {
      color = "#06b6d4" // Cyan
      emoji = "🐬"
    }

    return new DivIcon({
      html: `<div style="
        background-color: ${color}; 
        width: 30px; 
        height: 30px; 
        border-radius: 50%; 
        display: flex; 
        align-items: center; 
        justify-content: center;
        border: 2px solid white;
        font-size: 16px;
      ">${emoji}</div>`,
      className: "species-marker",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    })
  }

  // Alternative approach using SVG icons
  const customIcon = new Icon({
    iconUrl: createColoredMarker(getSpeciesType()),
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  })

  useEffect(() => {
    let lastTimestamp: number
    let direction = 1
    let progress = 0

    const animate = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp
      const elapsed = timestamp - lastTimestamp
      lastTimestamp = timestamp

      progress += elapsed * speedFactor * species.speed * direction

      if (progress > 1) {
        direction = -1
        progress = 1
      } else if (progress < 0) {
        direction = 1
        progress = 0
      }

      // Calculate position along the path
      const newLat = species.startPosition[0] + (species.endPosition[0] - species.startPosition[0]) * progress
      const newLng = species.startPosition[1] + (species.endPosition[1] - species.startPosition[1]) * progress

      setPosition([newLat, newLng])
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [species])

  return (
    <Marker
      position={position}
      icon={customIcon} // Use the SVG icon approach
      // Alternatively, use the HTML marker approach:
      // icon={createHtmlMarker()}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup>
        <div className="text-center">
          <p className="font-bold">{species.name}</p>
          <p className="text-xs">Click for details</p>
        </div>
      </Popup>
    </Marker>
  )
}
