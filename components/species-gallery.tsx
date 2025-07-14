"use client"

import Image from "next/image"
import { useState } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { MarineSpecies } from "@/lib/data"

interface SpeciesGalleryProps {
  species: MarineSpecies
}

export default function SpeciesGallery({ species }: SpeciesGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const galleryImages = species.galleryImages?.map((url, index) => ({
    url,
    caption: `${species.name} photo ${index + 1}`,
  })) ?? []

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {galleryImages.map((image, index) => (
          <div
            key={index}
            className="relative h-48 rounded-lg overflow-hidden cursor-pointer"
            onClick={() => setSelectedImage(index)}
          >
            <Image
              src={image.url}
              alt={image.caption}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>

      {/* Image lightbox */}
      {selectedImage !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
            disabled={selectedImage === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(Math.min(galleryImages.length - 1, selectedImage + 1))}
            disabled={selectedImage === galleryImages.length - 1}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          <div className="max-w-4xl max-h-[80vh]">
            <div className="relative h-[60vh] w-full">
              <Image
                src={galleryImages[selectedImage].url}
                alt={galleryImages[selectedImage].caption}
                fill
                className="object-contain"
              />
            </div>
            <p className="text-white text-center mt-4">{galleryImages[selectedImage].caption}</p>
          </div>
        </div>
      )}
    </div>
  )
}
