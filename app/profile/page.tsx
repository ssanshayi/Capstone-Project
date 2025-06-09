"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/lib/auth"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Settings, Heart, History, MapPin, Calendar, Mail } from "lucide-react"
import { marineSpeciesData } from "@/lib/data"

export default function ProfilePage() {
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
          <p>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  // Get favorite species data
  const favoriteSpecies = marineSpeciesData.filter((species) => user.favoriteSpecies.includes(species.id))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Profile sidebar */}
        <div className="md:w-1/3">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto relative w-32 h-32 mb-4">
                <Image
                  src={user.avatar || "/placeholder.svg?height=200&width=200"}
                  alt={user.name}
                  fill
                  className="rounded-full object-cover border-4 border-white shadow"
                />
              </div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription>
                <Badge variant="outline" className="mt-1">
                  {user.role === "researcher" ? "Marine Researcher" : "Ocean Enthusiast"}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <Mail className="mr-2 h-4 w-4 text-gray-500" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                  <span>Joined {user.joinDate}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Heart className="mr-2 h-4 w-4 text-gray-500" />
                  <span>{user.favoriteSpecies.length} Favorite Species</span>
                </div>

                <div className="pt-4 space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/profile/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Account Settings
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/profile/favorites">
                      <Heart className="mr-2 h-4 w-4" />
                      Favorite Species
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href="/profile/history">
                      <History className="mr-2 h-4 w-4" />
                      Tracking History
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="md:w-2/3">
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Overview</CardTitle>
                  <CardDescription>Your marine tracking activity and contributions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-cyan-50 p-4 rounded-lg">
                      <p className="text-sm text-cyan-700">Species Tracked</p>
                      <p className="text-2xl font-bold text-cyan-900">12</p>
                    </div>
                    <div className="bg-cyan-50 p-4 rounded-lg">
                      <p className="text-sm text-cyan-700">Observations</p>
                      <p className="text-2xl font-bold text-cyan-900">47</p>
                    </div>
                    <div className="bg-cyan-50 p-4 rounded-lg">
                      <p className="text-sm text-cyan-700">Contributions</p>
                      <p className="text-2xl font-bold text-cyan-900">8</p>
                    </div>
                  </div>

                  <h3 className="font-medium text-lg mb-3">Recent Tracking Sessions</h3>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center p-3 border rounded-lg">
                        <div className="mr-4 bg-cyan-100 p-2 rounded-full">
                          <MapPin className="h-5 w-5 text-cyan-700" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Pacific Ocean Tracking</p>
                          <p className="text-sm text-gray-500">Tracked 5 species • May {i + 2}, 2025</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="favorites" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Favorite Species</CardTitle>
                  <CardDescription>Marine species you're following</CardDescription>
                </CardHeader>
                <CardContent>
                  {favoriteSpecies.length === 0 ? (
                    <div className="text-center py-8">
                      <Heart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <h3 className="font-medium text-lg mb-1">No favorites yet</h3>
                      <p className="text-gray-500 mb-4">
                        Start adding species to your favorites to track them more easily
                      </p>
                      <Button asChild>
                        <Link href="/species">Browse Species</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {favoriteSpecies.map((species) => (
                        <div key={species.id} className="flex border rounded-lg overflow-hidden">
                          <div className="relative w-24 h-24">
                            <Image
                              src={species.imageUrl || "/placeholder.svg"}
                              alt={species.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 p-3">
                            <h3 className="font-medium">{species.name}</h3>
                            <p className="text-xs text-gray-500">{species.scientificName}</p>
                            <div className="flex mt-2 gap-2">
                              <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                                <Link href={`/species/${species.id}`}>Details</Link>
                              </Button>
                              <Button asChild size="sm" className="h-7 text-xs">
                                <Link href={`/tracking?species=${species.id}`}>Track</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your recent interactions with the platform</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="relative pl-6 border-l-2 border-cyan-200 pb-6">
                      <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-cyan-600"></div>
                      <div>
                        <p className="text-sm text-gray-500">Today</p>
                        <p className="font-medium">Tracked Blue Whale migration patterns</p>
                        <p className="text-sm text-gray-600">Spent 25 minutes observing migration data</p>
                      </div>
                    </div>
                    <div className="relative pl-6 border-l-2 border-cyan-200 pb-6">
                      <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-cyan-600"></div>
                      <div>
                        <p className="text-sm text-gray-500">Yesterday</p>
                        <p className="font-medium">Added Great White Shark to favorites</p>
                        <p className="text-sm text-gray-600">Updated your species preferences</p>
                      </div>
                    </div>
                    <div className="relative pl-6 border-l-2 border-cyan-200 pb-6">
                      <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-cyan-600"></div>
                      <div>
                        <p className="text-sm text-gray-500">May 5, 2025</p>
                        <p className="font-medium">Viewed conservation statistics</p>
                        <p className="text-sm text-gray-600">Explored data on marine protected areas</p>
                      </div>
                    </div>
                    <div className="relative pl-6 border-l-2 border-cyan-200">
                      <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-cyan-600"></div>
                      <div>
                        <p className="text-sm text-gray-500">May 3, 2025</p>
                        <p className="font-medium">Created account</p>
                        <p className="text-sm text-gray-600">Welcome to MarineTracker!</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
