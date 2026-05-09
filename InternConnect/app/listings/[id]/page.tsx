"use client"

import { use } from "react"
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
  CheckCircle
} from "lucide-react"
import { getListingById, getEmployerById } from "@/lib/mock-data"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ListingDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const listing = getListingById(id)
  const employer = listing ? getEmployerById(listing.employerId) : null

  if (!listing || !employer) {
    notFound()
  }

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
                  <AvatarImage src={employer.logo} alt={employer.companyName} />
                  <AvatarFallback className="text-lg">
                    {employer.companyName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-2xl">{listing.title}</CardTitle>
                  <p className="text-lg text-muted-foreground mt-1">{employer.companyName}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {listing.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {listing.workHours}/day
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
                {listing.requirements.map((req, index) => (
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
            <Link href={`/listings/${id}/apply`}>
              <Button className="w-full" size="lg">Apply Now</Button>
            </Link>
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
                  <AvatarImage src={employer.logo} alt={employer.companyName} />
                  <AvatarFallback>
                    {employer.companyName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{employer.companyName}</p>
                  <p className="text-sm text-muted-foreground">{employer.industry}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {employer.location}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  {employer.industry}
                </div>
              </div>

              <p className="text-sm text-muted-foreground">{employer.bio}</p>

              <Separator />

              <div className="space-y-3">
                <Link href={`/listings/${id}/apply`}>
                  <Button className="w-full" size="lg">Apply Now</Button>
                </Link>
                <p className="text-xs text-muted-foreground text-center">
                  Posted on {new Date(listing.postedDate).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Spacer for mobile fixed button */}
      <div className="h-20 lg:hidden" />
    </div>
  )
}
