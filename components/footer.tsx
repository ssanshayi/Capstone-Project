import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full border-t bg-white py-6">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-serif font-semibold text-cyan-700">MarineTracker</h3>
            <p className="text-sm text-gray-500">
              Tracking and monitoring marine species to support conservation efforts worldwide.
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-500 hover:text-cyan-700 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="text-sm text-gray-500 hover:text-cyan-700 transition-colors">
                  Tracking
                </Link>
              </li>
              <li>
                <Link href="/species" className="text-sm text-gray-500 hover:text-cyan-700 transition-colors">
                  Species Database
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-sm text-gray-500 hover:text-cyan-700 transition-colors">
                  Resources
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/resources?category=Research"
                  className="text-sm text-gray-500 hover:text-cyan-700 transition-colors"
                >
                  Research
                </Link>
              </li>
              <li>
                <Link
                  href="/resources?category=Documentary"
                  className="text-sm text-gray-500 hover:text-cyan-700 transition-colors"
                >
                  Documentaries
                </Link>
              </li>
              <li>
                <Link
                  href="/resources?category=Conservation"
                  className="text-sm text-gray-500 hover:text-cyan-700 transition-colors"
                >
                  Conservation
                </Link>
              </li>
              <li>
                <Link
                  href="/resources?category=Education"
                  className="text-sm text-gray-500 hover:text-cyan-700 transition-colors"
                >
                  Education
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-sm text-gray-500 hover:text-cyan-700 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-500 hover:text-cyan-700 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-500 hover:text-cyan-700 transition-colors">
                  Data Usage
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-gray-500 hover:text-cyan-700 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-6">
          <p className="text-xs text-gray-500 text-center">
            &copy; {new Date().getFullYear()} MarineTracker. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
