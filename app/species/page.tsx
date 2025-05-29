"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Filter, ChevronDown } from "lucide-react"
import { marineSpeciesData } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

export default function SpeciesPage() {
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilters, setSelectedFilters] = useState<{
    conservationStatus: string[]
    tags: string[]
  }>({
    conservationStatus: [],
    tags: [],
  })
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Extract all unique conservation statuses and tags
  const allConservationStatuses = Array.from(new Set(marineSpeciesData.map((species) => species.conservationStatus)))
  const allTags = Array.from(new Set(marineSpeciesData.flatMap((species) => species.tags)))

  // Filter species based on search query and filters
  const filteredSpecies = marineSpeciesData.filter((species) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      species.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      species.scientificName.toLowerCase().includes(searchQuery.toLowerCase())

    // Conservation status filter
    const matchesConservationStatus =
      selectedFilters.conservationStatus.length === 0 ||
      selectedFilters.conservationStatus.includes(species.conservationStatus)

    // Tags filter
    const matchesTags =
      selectedFilters.tags.length === 0 || species.tags.some((tag) => selectedFilters.tags.includes(tag))

    return matchesSearch && matchesConservationStatus && matchesTags
  })

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Toggle a filter value
  const toggleFilter = (type: "conservationStatus" | "tags", value: string) => {
    setSelectedFilters((prev) => {
      const current = [...prev[type]]
      const index = current.indexOf(value)
      if (index === -1) {
        current.push(value)
      } else {
        current.splice(index, 1)
      }
      return { ...prev, [type]: current }
    })
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilters({
      conservationStatus: [],
      tags: [],
    })
    setSearchQuery("")
  }

  // Get conservation status color
  const getStatusColor = (status: string) => {
    if (status.includes("Critically Endangered")) return "bg-red-500"
    if (status.includes("Endangered")) return "bg-orange-500"
    if (status.includes("Vulnerable")) return "bg-yellow-500"
    if (status.includes("Near Threatened")) return "bg-blue-500"
    if (status.includes("Least Concern")) return "bg-green-500"
    return "bg-gray-500"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-cyan-800 mb-2">Marine Species Database</h1>
        <p className="text-gray-600">
          Explore our comprehensive database of marine species. Learn about their habitats, behaviors, and conservation
          status.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search species by name..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <Filter size={16} />
                  Conservation Status
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {allConservationStatuses.map((status) => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    checked={selectedFilters.conservationStatus.includes(status)}
                    onCheckedChange={() => toggleFilter("conservationStatus", status)}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex gap-2">
                  <Filter size={16} />
                  Species Type
                  <ChevronDown size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {allTags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={selectedFilters.tags.includes(tag)}
                    onCheckedChange={() => toggleFilter("tags", tag)}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Active filters */}
        {(selectedFilters.conservationStatus.length > 0 || selectedFilters.tags.length > 0 || searchQuery) && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-500">Active filters:</span>
            {selectedFilters.conservationStatus.map((status) => (
              <Badge key={status} variant="secondary" className="bg-cyan-100 text-cyan-800">
                {status}
              </Badge>
            ))}
            {selectedFilters.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-cyan-100 text-cyan-800">
                {tag}
              </Badge>
            ))}
            {searchQuery && (
              <Badge variant="secondary" className="bg-cyan-100 text-cyan-800">
                Search: {searchQuery}
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs">
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* View toggle */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-sm text-gray-500">
          Showing {filteredSpecies.length} of {marineSpeciesData.length} species
        </p>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")} className="w-auto">
          <TabsList className="grid w-[180px] grid-cols-2">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-cyan-700" />
            <p>Loading species data...</p>
          </div>
        </div>
      ) : filteredSpecies.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">No species found matching your filters.</p>
          <Button variant="link" onClick={clearFilters}>
            Clear all filters
          </Button>
        </div>
      ) : (
        <Tabs value={viewMode} className="w-full">
          <TabsContent value="grid" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpecies.map((species) => (
                <Card key={species.id} className="overflow-hidden flex flex-col h-full">
                  <div className="relative h-48">
                    <Image
                      src={species.imageUrl || "/placeholder.svg"}
                      alt={species.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={`${getStatusColor(species.conservationStatus)} text-white`}>
                        {species.conservationStatus}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle>{species.name}</CardTitle>
                    <CardDescription>{species.scientificName}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2 flex-1">
                    <p className="text-sm text-gray-600 line-clamp-3 mb-3">{species.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {species.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <div className="flex justify-between items-center w-full">
                      <div className="text-sm">
                        <span className="text-gray-500">Population: </span>
                        <span
                          className={
                            species.populationTrend === "Increasing"
                              ? "text-green-600"
                              : species.populationTrend === "Stable"
                                ? "text-blue-600"
                                : "text-red-600"
                          }
                        >
                          {species.populationTrend}
                        </span>
                      </div>
                      <Button asChild size="sm">
                        <Link href={`/species/${species.id}`}>View Details</Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            <div className="space-y-4">
              {filteredSpecies.map((species) => (
                <Card key={species.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="relative w-full md:w-48 h-48 md:h-auto">
                      <Image
                        src={species.imageUrl || "/placeholder.svg"}
                        alt={species.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold">{species.name}</h3>
                          <p className="text-sm text-gray-500 italic">{species.scientificName}</p>
                        </div>
                        <Badge className={`${getStatusColor(species.conservationStatus)} text-white mt-2 md:mt-0`}>
                          {species.conservationStatus}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{species.description}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                        <div>
                          <span className="text-xs text-gray-500">Habitat:</span>
                          <p className="text-sm">{species.habitat}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Diet:</span>
                          <p className="text-sm">{species.diet}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Lifespan:</span>
                          <p className="text-sm">{species.lifespan}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Size:</span>
                          <p className="text-sm">{species.size}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {species.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          <span className="text-gray-500">Population: </span>
                          <span
                            className={
                              species.populationTrend === "Increasing"
                                ? "text-green-600"
                                : species.populationTrend === "Stable"
                                  ? "text-blue-600"
                                  : "text-red-600"
                            }
                          >
                            {species.populationTrend} ({species.populationPercentage}% of historic levels)
                          </span>
                        </div>
                        <Button asChild size="sm">
                          <Link href={`/species/${species.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
