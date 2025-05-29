import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-cyan-700" />
        <h2 className="text-2xl font-serif font-bold mb-2">Loading Resources</h2>
        <p className="text-gray-500">Please wait while we gather the latest marine research and documentaries...</p>
      </div>
    </div>
  )
}
