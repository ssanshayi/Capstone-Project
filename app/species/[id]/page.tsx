"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, notFound } from "next/navigation"
import { ArrowLeft, MapPin, ExternalLink, Share2, Bookmark } from "lucide-react"
import { marineSpeciesData } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { Icon } from "leaflet"
import { createColoredMarker } from "@/lib/icons"
import SpeciesGallery from "@/components/species-gallery"
import RelatedSpecies from "@/components/related-species"

export default function SpeciesDetailPage() {
  const params = useParams()
  const [species, setSpecies] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Find the species by ID
    const foundSpecies = marineSpeciesData.find((s) => s.id === params.id)

    // Simulate loading
    setTimeout(() => {
      setSpecies(foundSpecies || null)
      setLoading(false)
    }, 800)
  }, [params.id])

  // If species not found after loading, show 404
  if (!loading && !species) {
    notFound()
  }

  // Get conservation status color
  const getStatusColor = (status: string) => {
    if (status?.includes("Critically Endangered")) return "bg-red-500"
    if (status?.includes("Endangered")) return "bg-orange-500"
    if (status?.includes("Vulnerable")) return "bg-yellow-500"
    if (status?.includes("Near Threatened")) return "bg-blue-500"
    if (status?.includes("Least Concern")) return "bg-green-500"
    return "bg-gray-500"
  }

  // Get population trend color
  const getTrendColor = (trend: string) => {
    if (trend === "Increasing") return "text-green-600"
    if (trend === "Stable") return "text-blue-600"
    if (trend === "Decreasing") return "text-red-600"
    return "text-gray-600"
  }

  // Create a custom icon for the map
  const getCustomIcon = () => {
    if (!species) return null

    let speciesType = "fish"
    if (species.tags.includes("Shark") || species.name.toLowerCase().includes("shark")) {
      speciesType = "shark"
    } else if (species.tags.includes("Whale") || species.name.toLowerCase().includes("whale")) {
      speciesType = "whale"
    } else if (species.tags.includes("Turtle") || species.name.toLowerCase().includes("turtle")) {
      speciesType = "turtle"
    } else if (species.tags.includes("Ray") || species.name.toLowerCase().includes("ray")) {
      speciesType = "ray"
    } else if (
      species.tags.includes("Dolphin") ||
      species.name.toLowerCase().includes("dolphin") ||
      species.name.toLowerCase().includes("orca")
    ) {
      speciesType = "dolphin"
    }

    return new Icon({
      iconUrl: createColoredMarker(speciesType),
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    })
  }

  if (loading || !species) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse space-y-8 w-full max-w-4xl">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb navigation */}
      <div className="mb-6">
        <Link href="/species" className="text-cyan-700 hover:underline flex items-center gap-1">
          <ArrowLeft size={16} />
          <span>Back to Species Database</span>
        </Link>
      </div>

      {/* Species header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="md:w-1/2">
          <div className="relative rounded-lg overflow-hidden h-[300px] md:h-[400px]">
            <Image
              src={species.imageUrl || "/placeholder.svg"}
              alt={species.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        <div className="md:w-1/2">
          <div className="flex flex-wrap gap-2 mb-2">
            {species.tags.map((tag: string) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-cyan-800 mb-1">{species.name}</h1>
          <p className="text-gray-500 italic mb-4">{species.scientificName}</p>

          <div className="mb-4">
            <Badge className={`${getStatusColor(species.conservationStatus)} text-white`}>
              {species.conservationStatus}
            </Badge>
          </div>

          <p className="text-gray-700 mb-6">{species.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Habitat</h3>
              <p>{species.habitat}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Diet</h3>
              <p>{species.diet}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Average Size</h3>
              <p>{species.size}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Lifespan</h3>
              <p>{species.lifespan}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/tracking?species=${species.id}`}>Track This Species</Link>
            </Button>
            <Button variant="outline" className="gap-1">
              <Bookmark size={16} />
              Save
            </Button>
            <Button variant="outline" className="gap-1">
              <Share2 size={16} />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Detailed information tabs */}
      <Tabs defaultValue="overview" className="mt-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conservation">Conservation</TabsTrigger>
          <TabsTrigger value="habitat">Habitat & Range</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold mb-4">Biology & Behavior</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Physical Characteristics</h3>
                  <p className="text-gray-600 mt-1">
                    {species.name} can grow to {species.size}. They are known for their distinctive appearance and are
                    easily recognizable by their{" "}
                    {species.tags.includes("Shark")
                      ? "streamlined body and dorsal fin"
                      : species.tags.includes("Whale")
                        ? "large size and blowhole"
                        : "unique features"}
                    .
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Feeding Habits</h3>
                  <p className="text-gray-600 mt-1">
                    Their diet consists primarily of {species.diet}.{" "}
                    {species.tags.includes("Predator")
                      ? "As apex predators, they play a crucial role in maintaining the health of marine ecosystems."
                      : "They are an important part of the marine food web."}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Reproduction</h3>
                  <p className="text-gray-600 mt-1">
                    {species.tags.includes("Mammal")
                      ? `Like all mammals, ${species.name} give birth to live young. They typically have long gestation periods and care for their young for extended periods.`
                      : species.tags.includes("Shark")
                        ? `Depending on the species, sharks may lay eggs or give birth to live young. They typically have slow reproduction rates which makes them vulnerable to population decline.`
                        : `They have specific breeding patterns that are adapted to their marine environment.`}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Lifespan</h3>
                  <p className="text-gray-600 mt-1">
                    The average lifespan of {species.name} is {species.lifespan}. This relatively{" "}
                    {species.lifespan.includes("years") && Number.parseInt(species.lifespan) > 50 ? "long" : "standard"}{" "}
                    lifespan is influenced by factors such as habitat quality, food availability, and human impacts.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Tracking Data</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Migration Pattern</h3>
                  <p className="text-gray-600 mt-1">{species.migrationPattern}</p>
                </div>

                <div>
                  <h3 className="font-medium">Depth Range</h3>
                  <p className="text-gray-600 mt-1">{species.depthRange}</p>
                </div>

                <div>
                  <h3 className="font-medium">Average Speed</h3>
                  <p className="text-gray-600 mt-1">{species.averageSpeed}</p>
                </div>

                <div>
                  <h3 className="font-medium">Tracking History</h3>
                  <p className="text-gray-600 mt-1">
                    First tagged in {species.firstTagged}. Currently tracking {species.taggedCount} individuals.
                  </p>
                </div>

                <div className="mt-6">
                  <h3 className="font-medium mb-2">Population Trend</h3>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">Historic population</span>
                    <Progress value={100} className="h-2" />
                    <span className="text-sm">100%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Current population</span>
                    <Progress
                      value={species.populationPercentage}
                      className={`h-2 ${
                        species.populationTrend === "Increasing"
                          ? "bg-green-100 [&>div]:bg-green-500"
                          : species.populationTrend === "Stable"
                            ? "bg-blue-100 [&>div]:bg-blue-500"
                            : "bg-red-100 [&>div]:bg-red-500"
                      }`}
                    />
                    <span className={`text-sm ${getTrendColor(species.populationTrend)}`}>
                      {species.populationPercentage}%
                    </span>
                  </div>
                  <p className={`text-sm mt-1 ${getTrendColor(species.populationTrend)}`}>
                    {species.populationTrend} {species.populationTrend === "Decreasing" ? "⚠️" : ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="conservation" className="mt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold mb-4">Conservation Status</h2>
              <div className="mb-6">
                <div
                  className={`inline-block px-3 py-1 rounded-full text-white font-medium ${getStatusColor(species.conservationStatus)}`}
                >
                  {species.conservationStatus}
                </div>
                <p className="mt-4 text-gray-600">
                  The {species.name} is currently classified as <strong>{species.conservationStatus}</strong> according
                  to the International Union for Conservation of Nature (IUCN) Red List of Threatened Species.
                </p>

                <div className="mt-6">
                  <h3 className="font-medium">What This Means</h3>
                  <p className="text-gray-600 mt-1">
                    {species.conservationStatus.includes("Critically Endangered")
                      ? "This species is facing an extremely high risk of extinction in the wild."
                      : species.conservationStatus.includes("Endangered")
                        ? "This species is considered to be facing a very high risk of extinction in the wild."
                        : species.conservationStatus.includes("Vulnerable")
                          ? "This species is considered to be facing a high risk of extinction in the wild."
                          : species.conservationStatus.includes("Near Threatened")
                            ? "This species is close to qualifying for a threatened category in the near future."
                            : species.conservationStatus.includes("Least Concern")
                              ? "This species has been evaluated and does not qualify for a threatened category. It is widespread and abundant."
                              : "The conservation status indicates the risk of extinction for this species in the wild."}
                  </p>
                </div>
              </div>

              <h3 className="font-medium mt-6">Population Trend</h3>
              <p className={`mt-1 ${getTrendColor(species.populationTrend)}`}>
                <strong>{species.populationTrend}</strong> - Currently at {species.populationPercentage}% of historic
                levels
              </p>
              <Progress
                value={species.populationPercentage}
                className={`h-3 mt-2 ${
                  species.populationTrend === "Increasing"
                    ? "bg-green-100 [&>div]:bg-green-500"
                    : species.populationTrend === "Stable"
                      ? "bg-blue-100 [&>div]:bg-blue-500"
                      : "bg-red-100 [&>div]:bg-red-500"
                }`}
              />
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Threats & Conservation Efforts</h2>

              <div className="mb-6">
                <h3 className="font-medium">Major Threats</h3>
                <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                  {species.threats.map((threat: string, index: number) => (
                    <li key={index}>{threat}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium">Conservation Efforts</h3>
                <p className="text-gray-600 mt-1">{species.conservationEfforts}</p>

                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium">What's Being Done</h4>
                  <div className="bg-cyan-50 p-3 rounded-lg">
                    <h5 className="font-medium text-cyan-800">Protected Areas</h5>
                    <p className="text-sm text-gray-600">
                      Marine protected areas have been established to safeguard critical habitats.
                    </p>
                  </div>
                  <div className="bg-cyan-50 p-3 rounded-lg">
                    <h5 className="font-medium text-cyan-800">Fishing Regulations</h5>
                    <p className="text-sm text-gray-600">
                      Restrictions on fishing methods and catch limits help protect vulnerable populations.
                    </p>
                  </div>
                  <div className="bg-cyan-50 p-3 rounded-lg">
                    <h5 className="font-medium text-cyan-800">Research & Monitoring</h5>
                    <p className="text-sm text-gray-600">
                      Ongoing tracking and population studies inform conservation strategies.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="text-sm font-medium">How You Can Help</h4>
                  <ul className="list-disc list-inside text-gray-600 mt-1 space-y-1">
                    <li>Support marine conservation organizations</li>
                    <li>Reduce plastic consumption and properly dispose of waste</li>
                    <li>Choose sustainable seafood options</li>
                    <li>Spread awareness about marine conservation issues</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="habitat" className="mt-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-bold mb-4">Habitat & Distribution</h2>

              <div className="mb-6">
                <h3 className="font-medium">Natural Habitat</h3>
                <p className="text-gray-600 mt-1">{species.habitat}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-medium">Geographic Range</h3>
                <p className="text-gray-600 mt-1">{species.geographicRange}</p>
              </div>

              <div className="mb-6">
                <h3 className="font-medium">Depth Range</h3>
                <p className="text-gray-600 mt-1">{species.depthRange}</p>
              </div>

              <div>
                <h3 className="font-medium">Migration Pattern</h3>
                <p className="text-gray-600 mt-1">{species.migrationPattern}</p>
              </div>

              <div className="mt-8">
                <h3 className="font-medium mb-2">Ecosystem Role</h3>
                <p className="text-gray-600">
                  {species.tags.includes("Predator")
                    ? `As a predator, the ${species.name} plays a crucial role in maintaining the balance of marine ecosystems. By controlling the population of their prey, they help ensure the health and diversity of marine communities.`
                    : species.tags.includes("Filter Feeder")
                      ? `As a filter feeder, the ${species.name} plays an important role in marine ecosystems by filtering small organisms from the water. This helps maintain water quality and nutrient cycling in the ocean.`
                      : `The ${species.name} is an integral part of the marine ecosystem, contributing to the biodiversity and ecological balance of the oceans.`}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Range Map</h2>

              <div className="h-[400px] rounded-lg overflow-hidden border">
                <MapContainer
                  center={[
                    (species.startPosition[0] + species.endPosition[0]) / 2,
                    (species.startPosition[1] + species.endPosition[1]) / 2,
                  ]}
                  zoom={3}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <Marker position={species.startPosition} icon={getCustomIcon() || undefined}>
                    <Popup>
                      <div className="text-center">
                        <p className="font-bold">{species.name}</p>
                        <p className="text-xs">Observed location</p>
                      </div>
                    </Popup>
                  </Marker>
                  <Marker position={species.endPosition} icon={getCustomIcon() || undefined}>
                    <Popup>
                      <div className="text-center">
                        <p className="font-bold">{species.name}</p>
                        <p className="text-xs">Observed location</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-2">Key Habitats</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-cyan-700" />
                      <div>
                        <h4 className="font-medium">Feeding Grounds</h4>
                        <p className="text-xs text-gray-500">Areas with abundant food sources</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-cyan-700" />
                      <div>
                        <h4 className="font-medium">Breeding Areas</h4>
                        <p className="text-xs text-gray-500">Protected areas for reproduction</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-cyan-700" />
                      <div>
                        <h4 className="font-medium">Migration Routes</h4>
                        <p className="text-xs text-gray-500">Pathways between habitats</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-cyan-700" />
                      <div>
                        <h4 className="font-medium">Resting Areas</h4>
                        <p className="text-xs text-gray-500">Safe locations for recovery</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="mt-6">
          <SpeciesGallery species={species} />
        </TabsContent>
      </Tabs>

      {/* Related species */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Related Species</h2>
        <RelatedSpecies currentSpeciesId={species.id} />
      </div>

      {/* External resources */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-4">External Resources</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">IUCN Red List</h3>
                  <p className="text-sm text-gray-500">Conservation status information</p>
                </div>
                <Button variant="ghost" size="icon">
                  <ExternalLink className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Marine Bio</h3>
                  <p className="text-sm text-gray-500">Detailed biological information</p>
                </div>
                <Button variant="ghost" size="icon">
                  <ExternalLink className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Ocean Conservancy</h3>
                  <p className="text-sm text-gray-500">Conservation initiatives</p>
                </div>
                <Button variant="ghost" size="icon">
                  <ExternalLink className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
