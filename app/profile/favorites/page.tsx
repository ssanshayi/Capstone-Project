"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Heart, Search } from "lucide-react"
import { marineSpeciesData } from "@/lib/data"

export default function FavoritesPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-cyan-700" />
          <p>Loading favorites...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  // Get favorite species data
  const favoriteSpecies = marineSpeciesData.filter((species) => user.favoriteSpecies.includes(species.id))

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Favorite Species</h1>
          <p className="text-gray-600">Track and manage your favorite marine species</p>
        </div>
        <Button asChild>
          <Link href="/species">
            <Search className="mr-2 h-4 w-4" />
            Browse More Species
          </Link>
        </Button>
      </div>

      {favoriteSpecies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-bold mb-2">No Favorites Yet</h2>
            <p className="text-gray-500 text-center max-w-md mb-6">
              You haven't added any marine species to your favorites yet. Browse the species database and add some to
              your favorites.
            </p>
            <Button asChild>
              <Link href="/species">Browse Species</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteSpecies.map((species) => (
            <Card key={species.id} className="overflow-hidden flex flex-col h-full">
              <div className="relative h-48">
                <Image src={species.imageUrl || "/placeholder.svg"} alt={species.name} fill className="object-cover" />
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
              <div className="p-4 pt-0 mt-auto flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/species/${species.id}`}>Details</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href={`/tracking?species=${species.id}`}>Track</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
