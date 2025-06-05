"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Menu, User, LogOut, Settings, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/lib/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated, logout } = useAuth()

  const isActive = (path: string) => pathname === path

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-serif font-bold text-cyan-700">MarineTracker</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className={`text-sm font-medium transition-colors ${isActive("/") ? "text-cyan-700" : "hover:text-cyan-700"} animated-underline`}>
            Home
          </Link>
          <Link href="/tracking" className={`text-sm font-medium transition-colors ${isActive("/tracking") ? "text-cyan-700" : "hover:text-cyan-700"} animated-underline`}>
            Tracking
          </Link>
          <Link href="/species" className={`text-sm font-medium transition-colors ${isActive("/species") ? "text-cyan-700" : "hover:text-cyan-700"} animated-underline`}>
            Species
          </Link>
          <Link href="/resources" className={`text-sm font-medium transition-colors ${isActive("/resources") ? "text-cyan-700" : "hover:text-cyan-700"} animated-underline`}>
            Resources
          </Link>
          <Link href="/#ai-detection" className="text-sm font-medium hover:text-cyan-700 transition-colors animated-underline">
            AI Detection
          </Link>
          <Link href="#" className="text-sm font-medium hover:text-cyan-700 transition-colors animated-underline">
            About
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                    <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/favorites" className="cursor-pointer">
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Favorites</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Menu">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4 mt-8">
              <Link href="/" className={`text-lg font-medium transition-colors ${isActive("/") ? "text-cyan-700" : "hover:text-cyan-700"}`} onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link href="/tracking" className={`text-lg font-medium transition-colors ${isActive("/tracking") ? "text-cyan-700" : "hover:text-cyan-700"}`} onClick={() => setIsMenuOpen(false)}>
                Tracking
              </Link>
              <Link href="/species" className={`text-lg font-medium transition-colors ${isActive("/species") ? "text-cyan-700" : "hover:text-cyan-700"}`} onClick={() => setIsMenuOpen(false)}>
                Species
              </Link>
              <Link href="/resources" className={`text-lg font-medium transition-colors ${isActive("/resources") ? "text-cyan-700" : "hover:text-cyan-700"}`} onClick={() => setIsMenuOpen(false)}>
                Resources
              </Link>
              <Link href="/#ai-detection" className="text-lg font-medium hover:text-cyan-700 transition-colors" onClick={() => setIsMenuOpen(false)}>
                AI Detection
              </Link>
              <Link href="#" className="text-lg font-medium hover:text-cyan-700 transition-colors" onClick={() => setIsMenuOpen(false)}>
                About
              </Link>

              <div className="border-t pt-4 mt-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name} />
                        <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button asChild variant="outline" className="w-full justify-start" size="sm">
                        <Link href="/profile" onClick={() => setIsMenuOpen(false)}>
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full justify-start" size="sm">
                        <Link href="/profile/favorites" onClick={() => setIsMenuOpen(false)}>
                          <Heart className="mr-2 h-4 w-4" />
                          Favorites
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full justify-start" size="sm">
                        <Link href="/profile/settings" onClick={() => setIsMenuOpen(false)}>
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm" onClick={() => {
                        logout()
                        setIsMenuOpen(false)
                      }}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Button asChild className="w-full">
                      <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                        Log in
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                        Sign up
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
