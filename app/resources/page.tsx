"use client"

import { useState, useEffect } from "react"
import { Search, BookOpen, Film, Lightbulb, Leaf, Sparkles, X } from "lucide-react"
import { resourcesData, type ResourceCategory } from "@/lib/resources-data"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import ResourceCard from "@/components/resource-card"

export default function ResourcesPage() {
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>("All")
  const [featuredResources, setFeaturedResources] = useState<typeof resourcesData>([])
  const [filteredResources, setFilteredResources] = useState<typeof resourcesData>([])

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Filter resources based on search query and category
  useEffect(() => {
    // Get featured resources
    const featured = resourcesData.filter((resource) => resource.featured)
    setFeaturedResources(featured)

    // Filter resources based on search and category
    const filtered = resourcesData.filter((resource) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.author.toLowerCase().includes(searchQuery.toLowerCase())

      // Category filter
      const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory

      return matchesSearch && matchesCategory
    })

    setFilteredResources(filtered)
  }, [searchQuery, selectedCategory])

  // Get category icon
  const getCategoryIcon = (category: ResourceCategory) => {
    switch (category) {
      case "Research":
        return <BookOpen className="h-5 w-5" />
      case "Conservation":
        return <Leaf className="h-5 w-5" />
      case "Discovery":
        return <Sparkles className="h-5 w-5" />
      case "Documentary":
        return <Film className="h-5 w-5" />
      case "Education":
        return <Lightbulb className="h-5 w-5" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <section className="relative bg-gradient-to-r from-cyan-800 to-teal-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Marine Resources</h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              Explore our collection of research articles, conservation initiatives, discoveries, and educational
              documentaries about marine life and ocean ecosystems.
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
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Main content */}
      <section className="container mx-auto px-4 py-12">
        {/* Category filters */}
        <div className="mb-8">
          <h2 className="font-serif text-2xl font-bold mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "All" ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setSelectedCategory("All")}
            >
              All Resources
            </Button>
            <Button
              variant={selectedCategory === "Research" ? "default" : "outline"}
              className={`rounded-full ${
                selectedCategory === "Research" ? "bg-blue-600 hover:bg-blue-700" : "text-blue-600"
              }`}
              onClick={() => setSelectedCategory("Research")}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Research
            </Button>
            <Button
              variant={selectedCategory === "Conservation" ? "default" : "outline"}
              className={`rounded-full ${
                selectedCategory === "Conservation" ? "bg-green-600 hover:bg-green-700" : "text-green-600"
              }`}
              onClick={() => setSelectedCategory("Conservation")}
            >
              <Leaf className="mr-2 h-4 w-4" />
              Conservation
            </Button>
            <Button
              variant={selectedCategory === "Discovery" ? "default" : "outline"}
              className={`rounded-full ${
                selectedCategory === "Discovery" ? "bg-purple-600 hover:bg-purple-700" : "text-purple-600"
              }`}
              onClick={() => setSelectedCategory("Discovery")}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Discoveries
            </Button>
            <Button
              variant={selectedCategory === "Documentary" ? "default" : "outline"}
              className={`rounded-full ${
                selectedCategory === "Documentary" ? "bg-red-600 hover:bg-red-700" : "text-red-600"
              }`}
              onClick={() => setSelectedCategory("Documentary")}
            >
              <Film className="mr-2 h-4 w-4" />
              Documentaries
            </Button>
            <Button
              variant={selectedCategory === "Education" ? "default" : "outline"}
              className={`rounded-full ${
                selectedCategory === "Education" ? "bg-amber-600 hover:bg-amber-700" : "text-amber-600"
              }`}
              onClick={() => setSelectedCategory("Education")}
            >
              <Lightbulb className="mr-2 h-4 w-4" />
              Education
            </Button>
          </div>
        </div>

        {/* Search results */}
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

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-cyan-700" />
              <p>Loading resources...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Featured resources (only show when not searching) */}
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

            {/* All resources or filtered results */}
            {filteredResources.length === 0 ? (
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
                  {filteredResources.filter(
                    (resource) => !searchQuery && selectedCategory === "All" && resource.featured === true,
                  ).length > 0 &&
                    filteredResources
                      .filter((resource) => !(searchQuery === "" && selectedCategory === "All" && resource.featured))
                      .map((resource) => <ResourceCard key={resource.id} {...resource} />)}
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {/* Newsletter section */}
      <section className="bg-white py-16 border-t">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl font-bold mb-4">Stay Updated with Marine Research</h2>
            <p className="text-gray-600 mb-8">
              Subscribe to our newsletter to receive the latest marine research, conservation news, and documentary
              releases directly to your inbox.
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
