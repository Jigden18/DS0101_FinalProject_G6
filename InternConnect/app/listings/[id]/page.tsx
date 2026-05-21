"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ArrowLeft, 
  MapPin, 
  CalendarIcon, 
  Building2, 
  Clock, 
  DollarSign,
  CheckCircle,
  Loader2
} from "lucide-react"
import { getListing, checkApplication, getRelatedListings } from "@/lib/api-client"

interface PageProps {
  params: Promise<{ id: string }>
}

interface Listing {
  id: string
  title: string
  description: string
  location: string
  workHours: string
  stipend: string
  deadline: string
  jobField: string
  requirements: string[]
  postedDate: string
  status: string
  employer?: {
    id: string
    companyName: string
    logo?: string
    industry: string
    location: string
    bio: string
  }
}

export default function ListingDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasApplied, setHasApplied] = useState(false)
  const [relatedListings, setRelatedListings] = useState<Listing[]>([])

  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const { data, error: fetchError } = await getListing(id)
        if (fetchError) {
          setError(fetchError)
        } else if (data) {
          setListing(data)
        }

        const { data: applyData } = await checkApplication(id)
        if (applyData) {
          setHasApplied(!!applyData.has_applied)
        }

        const { data: relatedData } = await getRelatedListings(id)
        if (relatedData && Array.isArray(relatedData.listings)) {
          setRelatedListings(relatedData.listings)
        }
      } catch (err) {
        setError("Failed to fetch listing details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchListing()
  }, [id])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!listing || error) {
    notFound()
  }

  const employer = listing.employer

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link 
        href="/listings" 
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Listings
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14 flex-shrink-0">
                  <AvatarImage src={employer?.logo} alt={employer?.companyName} />
                  <AvatarFallback className="text-lg">
                    {employer?.companyName?.slice(0, 2).toUpperCase() || "CO"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{listing.title}</CardTitle>
                  <p className="text-lg text-muted-foreground mt-1">{employer?.companyName || "Company"}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {listing.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {listing.workHours}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  {listing.stipend}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  Deadline: {new Date(listing.deadline).toLocaleDateString()}
                </div>
              </div>

              <Badge variant="secondary" className="mt-4">
                {listing.jobField}
              </Badge>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {listing.requirements?.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Mobile Apply Button */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
            {hasApplied ? (
              <Button className="w-full" size="lg" disabled variant="outline">
                <CheckCircle className="mr-2 h-4 w-4 text-green-600 animate-pulse" />
                Applied
              </Button>
            ) : (
              <Link href={`/listings/${id}/apply`}>
                <Button className="w-full" size="lg">Apply Now</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Company Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={employer?.logo} alt={employer?.companyName} />
                  <AvatarFallback>
                    {employer?.companyName?.slice(0, 2).toUpperCase() || "CO"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{employer?.companyName}</p>
                  <p className="text-sm text-muted-foreground">{employer?.industry}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {employer?.location}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  {employer?.industry}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{employer?.bio}</p>

              <Separator />

              <div className="space-y-3">
                {hasApplied ? (
                  <Button className="w-full" size="lg" disabled variant="outline">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600 animate-pulse" />
                    Applied
                  </Button>
                ) : (
                  <Link href={`/listings/${id}/apply`}>
                    <Button className="w-full" size="lg">Apply Now</Button>
                  </Link>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  Posted on {new Date(listing.postedDate).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Opportunities */}
      {relatedListings.length > 0 && (
        <div className="mt-12 pt-8 border-t">
          <h2 className="text-xl font-bold mb-6 text-foreground">Related Opportunities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedListings.slice(0, 3).map((item) => (
              <Link key={item.id} href={`/listings/${item.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base line-clamp-1">{item.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{item.employer?.companyName || "Company"}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 flex-shrink-0" />
                        <span>{item.stipend}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Spacer for mobile fixed button */}
      <div className="h-20 lg:hidden" />
    </div>
  )
}
