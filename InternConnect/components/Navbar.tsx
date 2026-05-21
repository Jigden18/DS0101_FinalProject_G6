"use client"

import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Menu, User, LogOut, Settings } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const { role, isAuthenticated, logout, user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const studentLinks = [
    { href: "/listings", label: "Browse Listings" },
    { href: "/dashboard/student", label: "My Applications" },
  ]

  const employerLinks = [
    { href: "/dashboard/employer", label: "My Listings" },
    { href: "/dashboard/employer/listings/new", label: "Post Listing" },
  ]

  const adminLinks = [
    { href: "/dashboard/admin", label: "User Management" },
    { href: "/dashboard/admin/listings", label: "Moderate Listings" },
  ]

  const getLinks = () => {
    switch (role) {
      case "student":
        return studentLinks
      case "employer":
        return employerLinks
      case "admin":
        return adminLinks
      default:
        return []
    }
  }

  const links = getLinks()

  const getRoleBadgeColor = () => {
    switch (role) {
      case "student":
        return "bg-blue-100 text-blue-800"
      case "employer":
        return "bg-emerald-100 text-emerald-800"
      case "admin":
        return "bg-purple-100 text-purple-800"
      default:
        return ""
    }
  }

  const getProfileLink = () => {
    switch (role) {
      case "student":
        return "/profile/student"
      case "employer":
        return "/profile/employer"
      default:
        return "/"
    }
  }

  const getInitials = () => {
    if (!user?.name) return "U"
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarSrc = () => {
    if (role === "student" && user?.avatar) return user.avatar
    if (role === "employer" && user?.logo) return user.logo
    return undefined
  }

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">
                {role === "admin" ? "Admin Panel" : "InternConnect"}
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && role && (
              <Badge variant="secondary" className={`hidden sm:flex ${getRoleBadgeColor()}`}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Badge>
            )}

            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 h-auto py-1.5 px-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={getAvatarSrc()} alt={user?.name || "User"} />
                        <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium hidden lg:inline">
                        {role === "employer" ? user?.companyName : user?.name}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {role !== "admin" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href={getProfileLink()} className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-destructive">
                      <LogOut className="h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register/student">
                    <Button size="sm">Register</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation Menu</SheetTitle>
                  <SheetDescription>Mobile navigation menu options.</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                  {isAuthenticated && (
                    <div className="flex items-center gap-3 pb-4 border-b">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={getAvatarSrc()} alt={user?.name || "User"} />
                        <AvatarFallback>{getInitials()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {role === "employer" ? user?.companyName : user?.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </div>
                  )}

                  <nav className="flex flex-col gap-1">
                    {links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </nav>

                  <div className="border-t pt-4 mt-auto">
                    {isAuthenticated ? (
                      <div className="flex flex-col gap-2">
                        {role !== "admin" && (
                          <Link
                            href={getProfileLink()}
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Button variant="outline" className="w-full justify-start gap-2">
                              <Settings className="h-4 w-4" />
                              Profile Settings
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="destructive"
                          className="w-full justify-start gap-2"
                          onClick={() => {
                            logout()
                            setMobileMenuOpen(false)
                          }}
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                          <Button variant="outline" className="w-full">
                            Login
                          </Button>
                        </Link>
                        <Link href="/register/student" onClick={() => setMobileMenuOpen(false)}>
                          <Button className="w-full">Register</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
