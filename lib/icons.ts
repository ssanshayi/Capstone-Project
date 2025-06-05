// This file contains SVG icon data for different marine species types

// Create an SVG icon for a specific species type
export function createSpeciesIcon(speciesType: string): string {
  const iconData = getIconData(speciesType)

  // Create SVG with the icon data
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="18" fill="${iconData.color}" stroke="white" stroke-width="2" opacity="0.9" />
      <text x="20" y="25" font-family="Arial" font-size="16" text-anchor="middle" fill="white">${iconData.symbol}</text>
    </svg>
  `

  // Convert SVG to data URL
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

// Get color and symbol for each species type
function getIconData(speciesType: string): { color: string; symbol: string } {
  const lowerType = speciesType.toLowerCase()

  if (lowerType.includes("shark")) {
    return { color: "#ef4444", symbol: "🦈" } // Red for sharks
  } else if (lowerType.includes("whale")) {
    return { color: "#3b82f6", symbol: "🐋" } // Blue for whales
  } else if (lowerType.includes("turtle")) {
    return { color: "#10b981", symbol: "🐢" } // Green for turtles
  } else if (lowerType.includes("ray")) {
    return { color: "#8b5cf6", symbol: "🐡" } // Purple for rays
  } else if (lowerType.includes("dolphin") || lowerType.includes("orca")) {
    return { color: "#06b6d4", symbol: "🐬" } // Cyan for dolphins
  } else {
    return { color: "#f59e0b", symbol: "🐠" } // Amber for other marine species
  }
}

// Alternative icon approach using simple colored circles
export function createColoredMarker(speciesType: string): string {
  const iconData = getIconData(speciesType)

  // Create a simple SVG circle with the color
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r="16" fill="${iconData.color}" stroke="white" stroke-width="2" />
    </svg>
  `

  // Convert SVG to data URL
  return `data:image/svg+xml;base64,${btoa(svg)}`
}
