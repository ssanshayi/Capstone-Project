"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Compass, Fish, BarChart3, Shield, BookOpen, Users, Globe, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import NewsCard from "@/components/news-card"
import ConservationStats from "@/components/conservation-stats"
import UploadForm from "@/components/uploadform"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

export default function Home() {
  // State for resources
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  // State for species
  const [species, setSpecies] = useState<any[]>([])
  const [speciesLoading, setSpeciesLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("resources")
          .select("*")
        if (error) throw error
        if (data) {
          setResources(
            data.map((r: any) => ({
              ...r,
              imageUrl: r.image_url,
              authorAvatar: r.author_avatar,
              readTime: r.read_time,
            }))
          )
        }
      } catch (err) {
        setResources([])
      } finally {
        setLoading(false)
      }
    }
    const fetchSpecies = async () => {
      setSpeciesLoading(true)
      try {
        const { data, error } = await supabase
          .from("marine_species")
          .select("*")
        if (error) throw error
        if (data) {
          setSpecies(data)
        }
      } catch (err) {
        setSpecies([])
      } finally {
        setSpeciesLoading(false)
      }
    }
    fetchResources()
    fetchSpecies()
    // Fetch user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  // Handler for protected actions
  const handleProtectedAction = (href: string) => (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault()
      toast({
        title: "Authentication Required",
        description: "Please sign in or log in to use this feature.",
      })
    } else {
      router.push(href)
    }
  }

  // Helper to get latest N resources by category
  const getLatestByCategory = (category: string, n: number) => {
    return resources
      .filter((r) => r.category === category)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, n)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full h-[70vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.squarespace-cdn.com/content/v1/5e2755963c421657bd408970/5a3f2c8a-a67a-4efd-adf4-c3008bf36352/Reptiles.jpg"
            alt="Ocean"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        <div className="container relative z-10 mx-auto px-4 py-32 text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Marine Species Tracker</h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl">
            Explore and monitor marine life across the world's oceans with our interactive tracking platform.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-cyan-600 hover:bg-cyan-700">
              <a href="/tracking" onClick={handleProtectedAction("/tracking")}>
                Start Tracking <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-transparent text-white border-white hover:bg-white/20"
            >
              <Link href="#about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-cyan-800">About Our Platform</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our marine tracking system provides real-time data on marine species movements, helping researchers,
              conservationists, and ocean enthusiasts monitor and protect our ocean's biodiversity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <Compass className="h-10 w-10 text-cyan-600 mb-2" />
                <CardTitle>Interactive Tracking</CardTitle>
                <CardDescription>Follow marine species as they migrate across the world's oceans</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our satellite map displays real-time movements of various marine species, allowing you to observe
                  migration patterns and behaviors.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Fish className="h-10 w-10 text-cyan-600 mb-2" />
                <CardTitle>Species Information</CardTitle>
                <CardDescription>Detailed profiles of marine species</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access comprehensive information about each species, including conservation status, habitat, diet, and
                  more.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-cyan-600 mb-2" />
                <CardTitle>Data Analytics</CardTitle>
                <CardDescription>Visualize population trends and conservation status</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Explore interactive charts and graphs that illustrate population trends, tagging history, and
                  conservation efforts.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-cyan-600 mb-2" />
                <CardTitle>Conservation Focus</CardTitle>
                <CardDescription>Supporting marine conservation efforts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Learn about threats facing marine species and the conservation initiatives working to protect them.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Conservation Statistics Section */}
      <section className="py-20 bg-cyan-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-cyan-800">Ocean Conservation Impact</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our oceans face unprecedented challenges. Explore the current state of marine conservation and the impact
              of collective action.
            </p>
          </div>

          <ConservationStats />
        </div>
      </section>

      {/* Latest Research & News Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-cyan-800">Latest Research & News</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Stay informed about the latest discoveries, research findings, and conservation news from the marine
              science community.
            </p>
          </div>

          <Tabs defaultValue="research" className="w-full mb-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="research">Research</TabsTrigger>
              <TabsTrigger value="conservation">Conservation</TabsTrigger>
              <TabsTrigger value="discovery">Discoveries</TabsTrigger>
            </TabsList>
            <TabsContent value="research" className="mt-6">
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {getLatestByCategory("Research", 3).map((r) => (
                    <NewsCard
                      key={r.id}
                      title={r.title}
                      date={r.date}
                      category={r.category}
                      excerpt={r.excerpt}
                      imageUrl={r.imageUrl}
                      link={`/resources/${r.id}`}
                      onClick={handleProtectedAction(`/resources/${r.id}`)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="conservation" className="mt-6">
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {getLatestByCategory("Conservation", 3).map((r) => (
                    <NewsCard
                      key={r.id}
                      title={r.title}
                      date={r.date}
                      category={r.category}
                      excerpt={r.excerpt}
                      imageUrl={r.imageUrl}
                      link={`/resources/${r.id}`}
                      onClick={handleProtectedAction(`/resources/${r.id}`)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            <TabsContent value="discovery" className="mt-6">
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {getLatestByCategory("Discovery", 3).map((r) => (
                    <NewsCard
                      key={r.id}
                      title={r.title}
                      date={r.date}
                      category={r.category}
                      excerpt={r.excerpt}
                      imageUrl={r.imageUrl}
                      link={`/resources/${r.id}`}
                      onClick={handleProtectedAction(`/resources/${r.id}`)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          <div className="text-center mt-8">
            <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
              <Link href="/resources">See all resources</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Educational Resources Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-800 to-teal-800 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Educational Resources</h2>
            <p className="text-lg max-w-3xl mx-auto">
              Explore our collection of educational materials designed for students, educators, and ocean enthusiasts of
              all ages.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <BookOpen className="h-10 w-10 mb-2" />
                <CardTitle>Learning Materials</CardTitle>
                <CardDescription className="text-white/70">
                  Curriculum guides, lesson plans, and activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Access age-appropriate educational resources about marine biology, ocean conservation, and marine
                  ecosystems.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="secondary" className="w-full">
                  <Link href="#">Explore Resources</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <Globe className="h-10 w-10 mb-2" />
                <CardTitle>Interactive Webinars</CardTitle>
                <CardDescription className="text-white/70">Live sessions with marine experts</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Join our scheduled webinars featuring marine biologists, conservationists, and researchers from around
                  the world.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="secondary" className="w-full">
                  <Link href="#">View Schedule</Link>
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-white/10 border-white/20 text-white">
              <CardHeader>
                <Users className="h-10 w-10 mb-2" />
                <CardTitle>Citizen Science</CardTitle>
                <CardDescription className="text-white/70">Participate in research projects</CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Contribute to marine research through our citizen science initiatives. No scientific background
                  required!
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="secondary" className="w-full">
                  <Link href="#">Get Involved</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Detection Upload Section */}
      <section id="ai-detection" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-cyan-800">AI Species Detection</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Upload an image or video to automatically detect marine species using our trained YOLOv8 AI model.
            </p>
          </div>
          <UploadForm />
        </div>
      </section>

      {/* Featured Species Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-cyan-800">Featured Marine Species</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Discover some of the incredible marine species you can track on our platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {speciesLoading ? (
              <div className="col-span-3 text-center py-8">Loading...</div>
            ) : (
              // Randomly select up to 6 species
              (species.length > 0 ?
                shuffleArray(species).slice(0, 6).map((sp) => (
                  <Card key={sp.id} className="overflow-hidden">
                    <div className="relative h-48">
                      <Image src={sp.image_url || "/placeholder.svg"} alt={sp.name} fill className="object-cover" />
                      <div className="absolute top-2 right-2">
                        <Badge className={getStatusBadgeColor(sp.conservation_status)}>{sp.conservation_status}</Badge>
                      </div>
                    </div>
                    <CardHeader>
                      <CardTitle>{sp.name}</CardTitle>
                      <CardDescription>{sp.scientific_name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 line-clamp-3">{sp.description}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button asChild variant="outline">
                        <a href={`/species/${sp.id}`} onClick={handleProtectedAction(`/species/${sp.id}`)}>Learn More</a>
                      </Button>
                      <Button asChild>
                        <a href={`/tracking?species=${sp.id}`} onClick={handleProtectedAction(`/tracking?species=${sp.id}`)}>Track Now</a>
                      </Button>
                    </CardFooter>
                  </Card>
                )) : <div className="col-span-3 text-center py-8">No species found.</div>)
            )}
          </div>

          <div className="text-center mt-8">
            <Button asChild>
              <Link href="/species">
                View All Species <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-cyan-700" />
            <h2 className="text-3xl font-bold mb-4 text-cyan-800">Stay Updated</h2>
            <p className="text-lg text-gray-600 mb-8">
              Subscribe to our newsletter to receive the latest updates on marine research, conservation efforts, and
              tracking data.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <Input type="email" placeholder="Enter your email" className="flex-1" />
              <Button>Subscribe</Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">We respect your privacy. You can unsubscribe at any time.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-cyan-700 to-teal-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Explore the Oceans?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Start tracking marine species and contribute to our understanding of ocean ecosystems.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-cyan-700 hover:bg-gray-100">
              <Link href="/tracking">
                Launch Tracker <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
              <Link href="/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}

// Helper function to get badge color based on conservation status
function getStatusBadgeColor(status: string) {
  if (status.includes("Critically Endangered")) return "bg-red-500 text-white"
  if (status.includes("Endangered")) return "bg-orange-500 text-white"
  if (status.includes("Vulnerable")) return "bg-yellow-500 text-white"
  if (status.includes("Near Threatened")) return "bg-blue-500 text-white"
  if (status.includes("Least Concern")) return "bg-green-500 text-white"
  return "bg-gray-500 text-white"
}

// Helper to shuffle an array
function shuffleArray(array: any[]) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
