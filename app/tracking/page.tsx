"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import "leaflet/dist/leaflet.css"
import MarineSpeciesCard from "@/components/marine-species-card"
import AnalyticsPanel from "@/components/analytics-panel"
import { type MarineSpecies, marineSpeciesData } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

const MovingMarker = dynamic(() => import("@/components/moving-marker"), { ssr: false })
const Map = dynamic(
  () => import("react-leaflet").then((mod) => {
    const { MapContainer, TileLayer } = mod
    return function Map({ children }: { children: React.ReactNode }) {
      return (
        <MapContainer center={[25, -40]} zoom={3} style={{ height: "100%", width: "100%" }} zoomControl={false}>
          <TileLayer
            url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            maxZoom={20}
            subdomains={["mt0", "mt1", "mt2", "mt3"]}
            attribution="&copy; Google Maps"
          />
          {children}
        </MapContainer>
      )
    }
  }),
  { ssr: false }
)

export default function TrackingPage() {
  const searchParams = useSearchParams()
  const speciesId = searchParams.get("species")

  const [selectedSpecies, setSelectedSpecies] = useState<MarineSpecies | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [marineData, setMarineData] = useState<MarineSpecies[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading for a better user experience
    const timer = setTimeout(() => {
      setMarineData(marineSpeciesData)
      setLoading(false)

      // If a species ID is provided in the URL, select that species
      if (speciesId) {
        const species = marineSpeciesData.find((s) => s.id === speciesId)
        if (species) {
          setSelectedSpecies(species)
        }
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [speciesId])

  const handleMarkerClick = (species: MarineSpecies) => {
    setSelectedSpecies(species)
    setShowAnalytics(false)
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      <div className="bg-gradient-to-r from-cyan-700 to-teal-700 p-4 text-white">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold">Marine Species Tracker</h1>
          <p className="text-sm">Interactive tracking of marine species around the world</p>
        </div>
      </div>

      <div className="flex flex-col flex-1">
        <div className="container mx-auto px-4 py-4 flex justify-end">
          <Button
            variant="outline"
            className="text-cyan-700 border-cyan-700 hover:bg-cyan-50"
            onClick={() => setShowAnalytics(!showAnalytics)}
            disabled={loading}
          >
            {showAnalytics ? "Hide Analytics" : "Show Analytics"}
          </Button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-cyan-700" />
              <p>Loading marine species data...</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col md:flex-row">
            <div className={`${showAnalytics ? "md:w-2/3" : "w-full"} h-[60vh] md:h-[calc(100vh-200px)]`}>
              <Map>
                {marineData.map((species) => (
                  <MovingMarker key={species.id} species={species} onClick={() => handleMarkerClick(species)} />
                ))}
              </Map>
            </div>

            {showAnalytics ? (
              <div className="md:w-1/3 p-4 bg-gray-50 overflow-y-auto h-[30vh] md:h-[calc(100vh-200px)]">
                <AnalyticsPanel marineData={marineData} />
              </div>
            ) : (
              selectedSpecies && (
                <div className="md:w-1/3 p-4 bg-white overflow-y-auto h-[30vh] md:h-[calc(100vh-200px)]">
                  <MarineSpeciesCard species={selectedSpecies} onClose={() => setSelectedSpecies(null)} />
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
