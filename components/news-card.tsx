import Image from "next/image"
import Link from "next/link"
import { Calendar } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface NewsCardProps {
  title: string
  date: string
  category: string
  excerpt: string
  imageUrl: string
  link?: string
}

export default function NewsCard({
  title,
  date,
  category,
  excerpt,
  imageUrl,
  link = "#",
}: NewsCardProps) {
  const safeImageUrl =
    imageUrl && (imageUrl.startsWith("/") || imageUrl.startsWith("http"))
      ? imageUrl
      : "/placeholder.svg"

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative h-48">
        <Image src={safeImageUrl} alt={title} fill className="object-cover" />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-cyan-700 text-white">
            {category}
          </Badge>
        </div>
      </div>
      <CardContent className="pt-4 flex-1">
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{date}</span>
        </div>
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{excerpt}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={link}>Read More</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
