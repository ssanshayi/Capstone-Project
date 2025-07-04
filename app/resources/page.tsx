"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Search,
  BookOpen,
  Film,
  Lightbulb,
  Leaf,
  Sparkles,
  X,
  Loader2,
} from "lucide-react"
import { resourcesData, type ResourceCategory } from "@/lib/resources-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ResourceCard from "@/components/resource-card"
import type { JSX } from "react"
import { supabase } from "@/lib/supabase"

const categoryIcons: Record<ResourceCategory, JSX.Element> = {
  Research: <BookOpen className="mr-2 h-4 w-4" />,
  Conservation: <Leaf className="mr-2 h-4 w-4" />,
  Discovery: <Sparkles className="mr-2 h-4 w-4" />,
  Documentary: <Film className="mr-2 h-4 w-4" />,
  Education: <Lightbulb className="mr-2 h-4 w-4" />,
  All: <></>,
}

const categoryColors: Record<ResourceCategory, string> = {
  Research: "blue",
  Conservation: "green",
  Discovery: "purple",
  Documentary: "red",
  Education: "amber",
  All: "",
}

export default function ResourcesPage() {
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>("All")
  const [resources, setResources] = useState(resourcesData)

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase.from("resources").select("*")
      if (error) throw error
      if (data) {
        setResources(
          data.map((r: any) => ({
            ...r,
            featured: r.featured === true || r.featured === "true",
            imageUrl: r.image_url,
            authorAvatar: r.author_avatar,
            readTime: r.read_time,
          }))
        )
      }
    } catch (err) {
      setResources(resourcesData)
    } finally {
      setLoading(false)
    }
  }

  // Fetch and subscribe to changes
  useEffect(() => {
    fetchResources()

    const channel = supabase
      .channel("resources-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "resources" },
        () => {
          fetchResources()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const featuredResources = useMemo(
    () => resources.filter((resource) => resource.featured),
    [resources]
  )

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        searchQuery === "" ||
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.author.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === "All" || resource.category === selectedCategory

      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory, resources])

  const displayedResources = useMemo(() => {
    return filteredResources.filter(
      (r) =>
        !(!searchQuery && selectedCategory === "All" && r.featured)
    )
  }, [filteredResources, searchQuery, selectedCategory])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-cyan-800 to-teal-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Marine Resources</h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Explore our collection of research articles, conservation initiatives, discoveries,
              and educational documentaries about marine life and ocean ecosystems.
            </p>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search for resources..."
                className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70 h-12 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent" />
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-12">
        {/* Category Filters */}
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-bold mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            {(["All", "Research", "Conservation", "Discovery", "Documentary", "Education"] as ResourceCategory[]).map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`rounded-full ${
                  selectedCategory === category
                    ? `bg-${categoryColors[category]}-600 hover:bg-${categoryColors[category]}-700 text-white`
                    : categoryColors[category]
                      ? `text-${categoryColors[category]}-600`
                      : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category !== "All" && categoryIcons[category]}
                {category === "All" ? "All Resources" : category}
              </Button>
            ))}
          </div>
        </div>

        {/* Search Header */}
        {searchQuery && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-2xl font-bold">
                Search Results: <span className="text-gray-500">{filteredResources.length} resources found</span>
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="gap-1">
                <X size={16} /> Clear search
              </Button>
            </div>
          </div>
        )}

        {/* Loader */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-cyan-700" />
              <p>Loading resources...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Featured Resources */}
            {!searchQuery && selectedCategory === "All" && featuredResources.length > 0 && (
              <div className="mb-12">
                <h2 className="font-serif text-2xl font-bold mb-6">Featured Resources</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredResources.map((resource) => (
                    <ResourceCard key={resource.id} {...resource} />
                  ))}
                </div>
              </div>
            )}

            {/* Resource Results */}
            {displayedResources.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 mb-4">No resources found matching your search criteria.</p>
                <Button onClick={() => setSearchQuery("")}>Clear search</Button>
              </div>
            ) : (
              <div>
                <h2 className="font-serif text-2xl font-bold mb-6">
                  {searchQuery
                    ? "Search Results"
                    : selectedCategory === "All"
                    ? "All Resources"
                    : `${selectedCategory} Resources`}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedResources.map((resource) => (
                    <ResourceCard key={resource.id} {...resource} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Newsletter Section */}
      <section className="bg-white py-16 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl font-bold mb-4">Stay Updated with Marine Research</h2>
            <p className="text-gray-600 mb-8">
              Subscribe to our newsletter to receive the latest marine research, conservation news,
              and documentary releases directly to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <Input type="email" placeholder="Enter your email" className="flex-1" />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
