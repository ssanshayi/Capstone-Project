"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { getUserFavorites, removeFromFavorites } from "@/lib/favorites"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Heart, Search, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface FavoriteSpecies {
  id: string
  species_id: string
  created_at: string
  marine_species: {
    id: string
    name: string
    scientific_name: string
    category: string
    conservation_status: string
    description: string
    image_url: string
    tags: string[]
    population_trend: string
    population_percentage: number
  }
}

export default function FavoritesPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteSpecies[]>([])
  const [favoritesLoading, setFavoritesLoading] = useState(true)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  // 获取收藏列表
  useEffect(() => {
    if (user) {
      fetchFavorites()
    }
  }, [user])

  const fetchFavorites = async () => {
    if (!user) return
    
    setFavoritesLoading(true)
    try {
      const { favorites: data, error } = await getUserFavorites(user.id)
      
      if (error) {
        toast.error('Failed to fetch favorites list')
        console.error('Error fetching favorites:', error)
      } else {
        setFavorites(data)
      }
    } catch (error) {
      console.error('Error in fetchFavorites:', error)
      toast.error('获取收藏列表失败')
    } finally {
      setFavoritesLoading(false)
    }
  }

  const handleRemoveFavorite = async (speciesId: string) => {
    if (!user) return
    
    try {
      const { success, error } = await removeFromFavorites(user.id, speciesId)
      
      if (success) {
        setFavorites(favorites.filter(fav => fav.species_id !== speciesId))
        toast.success('Removed from favorites')
      } else {
        toast.error(error || 'Failed to remove')
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
      toast.error('Failed to remove, please try again')
    }
  }

  if (isLoading || favoritesLoading) {
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

  // Get favorite species data - now using real data from database

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

      {favorites.length === 0 ? (
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
          {favorites.map((favorite) => {
            const species = favorite.marine_species
            return (
              <Card key={favorite.id} className="overflow-hidden flex flex-col h-full">
                <div className="relative h-48">
                  <Image src={species.image_url || "/placeholder.svg"} alt={species.name} fill className="object-cover" />
                  <div className="absolute top-2 right-2">
                    <Badge className={`${getStatusColor(species.conservation_status)} text-white`}>
                      {species.conservation_status}
                    </Badge>
                  </div>
                  <div className="absolute top-2 left-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveFavorite(species.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle>{species.name}</CardTitle>
                  <CardDescription>{species.scientific_name}</CardDescription>
                </CardHeader>
                <CardContent className="pb-2 flex-1">
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">{species.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(species.tags || []).map((tag) => (
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
            )
          })}
        </div>
      )}
    </div>
  )
}
