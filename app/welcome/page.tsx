"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Fish, Globe, Users, Facebook, Instagram, Linkedin, Search, ArrowRight } from "lucide-react"
import { TypingAnimation } from "../../components/typing-animation"
import { useAuth } from "../../lib/auth"

export default function RootLandingPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const handleExploreClick = () => {
    if (isAuthenticated) {
      router.push("/")
    } else {
      router.push("/")
    }
  }

  const infoCards = [
    {
      number: "01",
      title: "Marine Species Tracking",
      description: "Monitor endangered marine life with advanced precision.",
      icon: Fish,
      link: "/conservation",
    },
    {
      number: "02",
      title: "Marine Identification",
      description: "Identify diverse marine species with our advanced recognition tools.",
      icon: Search,
      link: "/conservation",
    },
    {
      number: "03",
      title: "Community Conservation",
      description: "Join a global network of ocean enthusiasts and volunteers.",
      icon: Users,
      link: "/conservation",
    },
    {
      number: "04",
      title: "Ocean Habitat Restoration",
      description: "Support initiatives to restore vital marine ecosystems.",
      icon: Globe,
      link: "/conservation",
    },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('/welcome.jpg')`,
        }}
      />

      {/* Header and Main Content Wrapper */}
      <div className="relative z-10 flex flex-col flex-grow">

        {/* Main Hero Content */}
        <main className="flex-grow flex flex-col lg:flex-row items-center justify-between py-8 px-8 md:py-12 md:px-16">
          <div className="flex flex-col items-start text-white max-w-2xl mb-12 lg:mb-0">
            <h1 className="text-6xl md:text-8xl font-bold mb-4 leading-none">
              Explore the
              <br />
              Ocean's Depths
            </h1>
            <TypingAnimation
              text="Track and identify marine life with precision and ease. Discover the wonders of the sea with our advanced technology."
              speed={40}
            />
            <Button
              onClick={handleExploreClick}
              className="bg-[#0056b3] hover:bg-[#003f80] text-white px-8 py-3 text-lg"
            >
              Explore Now!
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Right-hand Info Cards */}
          <div className="flex flex-col space-y-6 w-full lg:w-80">
            {infoCards.map((card, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-lg border border-white/20 text-white
                           transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer"
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                    <card.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold opacity-70">{card.number}</span>
                    <h3 className="text-lg font-bold">{card.title}</h3>
                  </div>
                </div>
                <p className="text-sm opacity-80">{card.description}</p>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-sm rotate-90 origin-bottom-left hidden md:block z-20">
        <span className="whitespace-nowrap"></span>
        <div className="w-px h-16 bg-white mx-auto mt-2" />
      </div>
    </div>
  )
}
