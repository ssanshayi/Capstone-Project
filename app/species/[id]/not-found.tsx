import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SpeciesNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-cyan-800 mb-4">Species Not Found</h1>
      <p className="text-lg text-gray-600 mb-8">
        We couldn't find the marine species you're looking for. It might have swum away!
      </p>
      <Button asChild>
        <Link href="/species">Return to Species Database</Link>
      </Button>
    </div>
  )
}
