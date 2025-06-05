import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ResourceNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-serif font-bold text-cyan-800 mb-4">Resource Not Found</h1>
      <p className="text-lg text-gray-600 mb-8">
        We couldn't find the resource you're looking for. It may have been moved or deleted.
      </p>
      <Button asChild>
        <Link href="/resources">Return to Resources</Link>
      </Button>
    </div>
  )
}
