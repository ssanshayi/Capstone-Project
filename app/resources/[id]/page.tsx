"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, notFound } from "next/navigation"
import { ArrowLeft, Calendar, Clock, Share2, Bookmark, ExternalLink } from "lucide-react"
import { resourcesData } from "@/lib/resources-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function ResourceDetailPage() {
  const params = useParams()
  const [resource, setResource] = useState<any>(null)
  const [relatedResources, setRelatedResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchResource = async () => {
      setLoading(true)
      let foundResource = null
      try {
        const { data, error } = await supabase
          .from("resources")
          .select("*")
          .eq("id", params.id)
          .single()
        if (data) {
          foundResource = {
            ...data,
            featured: data.featured === true || data.featured === "true",
            imageUrl: data.image_url,
            authorAvatar: data.author_avatar,
            readTime: data.read_time,
          }
        }
      } catch (err) {
        // ignore, fallback to static
      }
      if (!foundResource) {
        // fallback to static data
        const staticResource = resourcesData.find((r) => r.id === params.id)
        if (staticResource) {
          foundResource = staticResource
        }
      }
      // Find related resources (same category)
      let related = []
      if (foundResource) {
        related = resourcesData.filter((r) => r.category === foundResource.category && r.id !== foundResource.id).slice(0, 3)
      }
      setResource(foundResource || null)
      setRelatedResources(related || [])
      setLoading(false)
    }
    fetchResource()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  // If resource not found after loading, show 404
  if (!loading && !resource) {
    notFound()
  }

  // Get category badge color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Research":
        return "bg-blue-600 hover:bg-blue-700"
      case "Conservation":
        return "bg-green-600 hover:bg-green-700"
      case "Discovery":
        return "bg-purple-600 hover:bg-purple-700"
      case "Documentary":
        return "bg-red-600 hover:bg-red-700"
      case "Education":
        return "bg-amber-600 hover:bg-amber-700"
      default:
        return "bg-cyan-700 hover:bg-cyan-800"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-cyan-700" />
          <h2 className="text-xl font-serif font-bold mb-2">Loading Resource</h2>
          <p className="text-gray-500">Please wait while we prepare this content for you...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb navigation */}
        <div className="mb-6">
          <Link href="/resources" className="text-cyan-700 hover:underline flex items-center gap-1">
            <ArrowLeft size={16} />
            <span>Back to Resources</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <article className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Featured image */}
              <div className="relative h-[300px] md:h-[400px]">
                <Image
                  src={resource.imageUrl || "/placeholder.svg"}
                  alt={resource.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute top-4 right-4">
                  <Badge className={`${getCategoryColor(resource.category)} text-white`}>{resource.category}</Badge>
                </div>
              </div>

              {/* Article content */}
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{resource.date}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{resource.readTime}</span>
                  </div>
                </div>

                <h1 className="font-serif text-3xl md:text-4xl font-bold mb-4 leading-tight">{resource.title}</h1>

                <div className="flex items-center mb-6">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={resource.authorAvatar || "/placeholder.svg"} alt={resource.author} />
                    <AvatarFallback>{resource.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{resource.author}</p>
                    <p className="text-sm text-gray-500">
                      {resource.category === "Research" ? "Researcher" : "Contributor"}
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* For a documentary, show a video player mockup */}
                {resource.category === "Documentary" ? (
                  <div className="mb-8">
                    <div className="relative bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                      <Image
                        src={resource.imageUrl || "/placeholder.svg"}
                        alt={resource.title}
                        fill
                        className="object-cover opacity-60"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white/20 backdrop-blur-sm p-6 rounded-full cursor-pointer hover:bg-white/30 transition-colors">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-white"
                          >
                            <polygon points="5 3 19 12 5 21 5 3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Click play to watch {resource.title} • {resource.readTime}
                    </p>
                  </div>
                ) : null}

                {/* Article excerpt (in a real app, this would be the full content) */}
                <div className="prose max-w-none">
                  <p className="text-lg mb-4">{resource.excerpt}</p>
                  <p className="mb-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia,
                    nisl nisl aliquam nisl, eu aliquam nisl nisl sit amet nisl. Sed euismod, nisl vel ultricies lacinia,
                    nisl nisl aliquam nisl, eu aliquam nisl nisl sit amet nisl.
                  </p>
                  <h2 className="text-2xl font-serif font-bold mt-8 mb-4">Key Findings</h2>
                  <p className="mb-4">
                    Nullam quis risus eget urna mollis ornare vel eu leo. Cum sociis natoque penatibus et magnis dis
                    parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula ut id elit.
                  </p>
                  <ul className="list-disc pl-6 mb-6">
                    <li className="mb-2">
                      Aenean lacinia bibendum nulla sed consectetur. Nulla vitae elit libero, a pharetra augue.
                    </li>
                    <li className="mb-2">
                      Vestibulum id ligula porta felis euismod semper. Morbi leo risus, porta ac consectetur ac.
                    </li>
                    <li className="mb-2">Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.</li>
                  </ul>
                  <p className="mb-4">
                    Donec ullamcorper nulla non metus auctor fringilla. Maecenas faucibus mollis interdum. Fusce
                    dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet
                    risus.
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 mt-8">
                  <Button variant="outline" className="gap-1">
                    <Bookmark size={16} />
                    Save
                  </Button>
                  <Button variant="outline" className="gap-1">
                    <Share2 size={16} />
                    Share
                  </Button>
                  {resource.category === "Research" && (
                    <Button variant="outline" className="gap-1">
                      <ExternalLink size={16} />
                      View Full Research Paper
                    </Button>
                  )}
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Related resources */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="font-serif text-xl font-bold mb-4">Related Resources</h2>
              <div className="space-y-4">
                {relatedResources.length > 0 ? (
                  relatedResources.map((related) => (
                    <div key={related.id} className="flex gap-3">
                      <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden">
                        <Image
                          src={related.imageUrl || "/placeholder.svg"}
                          alt={related.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <Badge className={`${getCategoryColor(related.category)} text-white mb-1`}>
                          {related.category}
                        </Badge>
                        <h3 className="font-medium line-clamp-2 mb-1">
                          <Link href={`/resources/${related.id}`} className="hover:text-cyan-700">
                            {related.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-500">{related.readTime}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No related resources found.</p>
                )}
              </div>
              <Button asChild variant="outline" className="w-full mt-4">
                <Link href="/resources">View All Resources</Link>
              </Button>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-serif text-xl font-bold mb-4">Resource Categories</h2>
              <div className="space-y-2">
                <Link
                  href="/resources?category=Research"
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <div className="flex items-center">
                    <Badge className="bg-blue-600 mr-2">
                      <span className="sr-only">Research</span>
                    </Badge>
                    <span>Research Articles</span>
                  </div>
                  <span className="text-gray-500 text-sm">
                    {resourcesData.filter((r) => r.category === "Research").length}
                  </span>
                </Link>
                <Link
                  href="/resources?category=Conservation"
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <div className="flex items-center">
                    <Badge className="bg-green-600 mr-2">
                      <span className="sr-only">Conservation</span>
                    </Badge>
                    <span>Conservation</span>
                  </div>
                  <span className="text-gray-500 text-sm">
                    {resourcesData.filter((r) => r.category === "Conservation").length}
                  </span>
                </Link>
                <Link
                  href="/resources?category=Discovery"
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <div className="flex items-center">
                    <Badge className="bg-purple-600 mr-2">
                      <span className="sr-only">Discovery</span>
                    </Badge>
                    <span>Discoveries</span>
                  </div>
                  <span className="text-gray-500 text-sm">
                    {resourcesData.filter((r) => r.category === "Discovery").length}
                  </span>
                </Link>
                <Link
                  href="/resources?category=Documentary"
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <div className="flex items-center">
                    <Badge className="bg-red-600 mr-2">
                      <span className="sr-only">Documentary</span>
                    </Badge>
                    <span>Documentaries</span>
                  </div>
                  <span className="text-gray-500 text-sm">
                    {resourcesData.filter((r) => r.category === "Documentary").length}
                  </span>
                </Link>
                <Link
                  href="/resources?category=Education"
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                >
                  <div className="flex items-center">
                    <Badge className="bg-amber-600 mr-2">
                      <span className="sr-only">Education</span>
                    </Badge>
                    <span>Educational Resources</span>
                  </div>
                  <span className="text-gray-500 text-sm">
                    {resourcesData.filter((r) => r.category === "Education").length}
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
