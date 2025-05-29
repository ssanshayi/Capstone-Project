"use client"

import Image from "next/image"
import { X } from "lucide-react"
import type { MarineSpecies } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface MarineSpeciesCardProps {
  species: MarineSpecies
  onClose: () => void
}

export default function MarineSpeciesCard({ species, onClose }: MarineSpeciesCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="relative pb-2">
        <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
        <CardTitle className="text-xl text-cyan-800">{species.name}</CardTitle>
        <CardDescription>{species.scientificName}</CardDescription>
        <div className="flex flex-wrap gap-1 mt-1">
          {species.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-cyan-100 text-cyan-800">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="info">
          <TabsList className="w-full">
            <TabsTrigger value="info" className="flex-1">
              Information
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex-1">
              Statistics
            </TabsTrigger>
            <TabsTrigger value="habitat" className="flex-1">
              Habitat
            </TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="pt-4">
            <div className="flex flex-col gap-4">
              <div className="relative w-full h-48 rounded-md overflow-hidden">
                <Image src={species.imageUrl || "/placeholder.svg"} alt={species.name} fill className="object-cover" />
              </div>
              <div>
                <h3 className="font-medium text-lg">About</h3>
                <p className="text-sm text-gray-600 mt-1">{species.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Conservation Status:</span>
                  <p className="text-gray-600">{species.conservationStatus}</p>
                </div>
                <div>
                  <span className="font-medium">Average Lifespan:</span>
                  <p className="text-gray-600">{species.lifespan}</p>
                </div>
                <div>
                  <span className="font-medium">Average Size:</span>
                  <p className="text-gray-600">{species.size}</p>
                </div>
                <div>
                  <span className="font-medium">Diet:</span>
                  <p className="text-gray-600">{species.diet}</p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="stats" className="pt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Population Trend</h3>
                <div className="h-4 w-full bg-gray-200 rounded-full mt-2">
                  <div
                    className={`h-4 rounded-full ${
                      species.populationTrend === "Increasing"
                        ? "bg-green-500"
                        : species.populationTrend === "Stable"
                          ? "bg-blue-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${species.populationPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Population: {species.populationPercentage}% of historic levels</span>
                  <span>{species.populationTrend}</span>
                </div>
              </div>

              <div>
                <h3 className="font-medium">Migration Pattern</h3>
                <p className="text-sm text-gray-600 mt-1">{species.migrationPattern}</p>
              </div>

              <div>
                <h3 className="font-medium">Tracking Data</h3>
                <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                  <div className="bg-gray-100 p-2 rounded">
                    <span className="text-xs text-gray-500">Depth Range</span>
                    <p className="font-medium">{species.depthRange}</p>
                  </div>
                  <div className="bg-gray-100 p-2 rounded">
                    <span className="text-xs text-gray-500">Speed</span>
                    <p className="font-medium">{species.averageSpeed}</p>
                  </div>
                  <div className="bg-gray-100 p-2 rounded">
                    <span className="text-xs text-gray-500">Tagged Individuals</span>
                    <p className="font-medium">{species.taggedCount}</p>
                  </div>
                  <div className="bg-gray-100 p-2 rounded">
                    <span className="text-xs text-gray-500">First Tagged</span>
                    <p className="font-medium">{species.firstTagged}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="habitat" className="pt-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Habitat</h3>
                <p className="text-sm text-gray-600 mt-1">{species.habitat}</p>
              </div>

              <div>
                <h3 className="font-medium">Geographic Range</h3>
                <p className="text-sm text-gray-600 mt-1">{species.geographicRange}</p>
              </div>

              <div>
                <h3 className="font-medium">Threats</h3>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                  {species.threats.map((threat, index) => (
                    <li key={index}>{threat}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium">Conservation Efforts</h3>
                <p className="text-sm text-gray-600 mt-1">{species.conservationEfforts}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
        <Button size="sm" className="bg-cyan-700 hover:bg-cyan-800">
          Track This Species
        </Button>
      </CardFooter>
    </Card>
  )
}
