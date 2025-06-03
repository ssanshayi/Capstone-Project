import Image from "next/image"
import Link from "next/link"
import { Calendar, Clock, ExternalLink } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface ResourceCardProps {
  id: string
  title: string
  date: string
  category: "Research" | "Conservation" | "Discovery" | "Documentary" | "Education"
  excerpt: string
  imageUrl: string
  readTime: string
  author: string
  authorAvatar?: string
  link?: string
  featured?: boolean
}

export default function ResourceCard({
  id,
  title,
  date,
  category,
  excerpt,
  imageUrl,
  readTime,
  author,
  authorAvatar,
  link = "#",
  featured = false,
}: ResourceCardProps) {
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

  return (
    <Card className={`overflow-hidden flex flex-col h-full article-card ${featured ? "border-2 border-cyan-500" : ""}`}>
      <div className="relative h-48 md:h-56">
        <Image src={imageUrl || "/placeholder.svg"} alt={title} fill className="object-cover" />
        <div className="absolute top-2 right-2">
          <Badge className={`${getCategoryColor(category)} text-white`}>{category}</Badge>
        </div>
        {featured && (
          <div className="absolute top-2 left-2">
            <Badge variant="outline" className="bg-white/80 text-cyan-800 border-cyan-500">
              Featured
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="pt-4 flex-1">
        <div className="flex items-center text-sm text-gray-500 mb-2 gap-4">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{date}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{readTime}</span>
          </div>
        </div>
        <h3 className="font-serif font-bold text-xl mb-2 leading-tight">{title}</h3>
        <p className="text-gray-600 text-sm">{excerpt}</p>

        <div className="flex items-center mt-4">
          <div className="relative h-8 w-8 rounded-full overflow-hidden mr-3">
            <Image
              src={authorAvatar || `/placeholder.svg?height=50&width=50&text=${author.charAt(0)}`}
              alt={author}
              fill
              className="object-cover"
            />
          </div>
          <span className="text-sm font-medium">{author}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild variant="outline" className="w-full group">
          <Link href={`/resources/${id}`}>
            {category === "Documentary" ? "Watch Now" : "Read Article"}
            <ExternalLink className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
