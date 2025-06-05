import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { marineSpeciesData } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RelatedSpeciesProps {
  currentSpeciesId: string
}

export default function RelatedSpecies({ currentSpeciesId }: RelatedSpeciesProps) {
  // Find the current species
  const currentSpecies = marineSpeciesData.find((species) => species.id === currentSpeciesId)

  if (!currentSpecies) return null

  // Find related species based on tags and conservation status
  const relatedSpecies = marineSpeciesData
    .filter(
      (species) =>
        species.id !== currentSpeciesId && // Not the current species
        // Same conservation status
        (species.conservationStatus === currentSpecies.conservationStatus ||
          // Or shares at least one tag
          species.tags.some((tag) => currentSpecies.tags.includes(tag))),
    )
    .slice(0, 3) // Limit to 3 related species

  if (relatedSpecies.length === 0) return null

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {relatedSpecies.map((species) => (
        <Card key={species.id} className="overflow-hidden">
          <div className="relative h-48">
            <Image src={species.imageUrl || "/placeholder.svg"} alt={species.name} fill className="object-cover" />
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-white/80">
                {species.conservationStatus}
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-bold text-lg">{species.name}</h3>
            <p className="text-sm text-gray-500 italic">{species.scientificName}</p>
            <p className="text-sm text-gray-600 line-clamp-2 mt-2">{species.description}</p>
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <Button asChild variant="outline" className="w-full">
              <Link href={`/species/${species.id}`} className="flex items-center justify-center gap-1">
                View Species <ChevronRight size={16} />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
