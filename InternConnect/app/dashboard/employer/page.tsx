"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { StatusBadge } from "@/components/StatusBadge"
import { EmptyState } from "@/components/EmptyState"
import { Plus, Pencil, XCircle, Users } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { listings, getApplicationsByListing } from "@/lib/mock-data"

export default function EmployerDashboardPage() {
  const { currentEmployer } = useAuth()
  const [closedListings, setClosedListings] = useState<Set<string>>(new Set())
  
  // Get listings for the current employer (or first employer if using role switcher)
  const employerId = currentEmployer?.id || "employer-1"
  const employerListings = listings.filter(l => l.employerId === employerId)

  const handleCloseListing = (listingId: string) => {
    setClosedListings(prev => new Set([...prev, listingId]))
    toast.success("Listing closed successfully!")
  }

  const getListingStatus = (listingId: string, originalStatus: string) => {
    if (closedListings.has(listingId)) return "closed"
    return originalStatus as "active" | "closed" | "pending"
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your job and internship postings
          </p>
        </div>
        <Link href="/dashboard/employer/listings/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Post New Listing
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listing Management</CardTitle>
          <CardDescription>
            View, edit, and manage all your posted opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employerListings.length === 0 ? (
            <EmptyState
              type="listings"
              title="No listings posted yet"
              description="Create your first job listing to start receiving applications from students."
            />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Work Hours</TableHead>
                      <TableHead>Stipend</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Applicants</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employerListings.map((listing) => {
                      const applicantCount = getApplicationsByListing(listing.id).length
                      const status = getListingStatus(listing.id, listing.status)
                      
                      return (
                        <TableRow key={listing.id}>
                          <TableCell className="font-medium">{listing.title}</TableCell>
                          <TableCell>{listing.location}</TableCell>
                          <TableCell>{listing.workHours}/day</TableCell>
                          <TableCell>{listing.stipend}</TableCell>
                          <TableCell>{new Date(listing.deadline).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <StatusBadge status={status} />
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/dashboard/employer/listings/${listing.id}/applicants`}
                              className="text-primary hover:underline"
                            >
                              {applicantCount} applicants
                            </Link>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/dashboard/employer/listings/${listing.id}/applicants`}>
                                <Button variant="ghost" size="sm" title="View Applicants">
                                  <Users className="h-4 w-4" />
                                  <span className="sr-only">View Applicants</span>
                                </Button>
                              </Link>
                              <Link href={`/dashboard/employer/listings/edit/${listing.id}`}>
                                <Button variant="ghost" size="sm" title="Edit">
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                              </Link>
                              {status !== "closed" && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm" title="Close Listing">
                                      <XCircle className="h-4 w-4" />
                                      <span className="sr-only">Close Listing</span>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Close this listing?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will stop accepting new applications for &quot;{listing.title}&quot;. 
                                        You can still view existing applications.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleCloseListing(listing.id)}>
                                        Close Listing
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {employerListings.map((listing) => {
                  const applicantCount = getApplicationsByListing(listing.id).length
                  const status = getListingStatus(listing.id, listing.status)
                  
                  return (
                    <Card key={listing.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="font-medium">{listing.title}</p>
                            <p className="text-sm text-muted-foreground">{listing.location}</p>
                          </div>
                          <StatusBadge status={status} />
                        </div>
                        <div className="text-sm text-muted-foreground mb-4 space-y-1">
                          <p>Deadline: {new Date(listing.deadline).toLocaleDateString()}</p>
                          <p>{applicantCount} applicants</p>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/dashboard/employer/listings/${listing.id}/applicants`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              <Users className="h-4 w-4 mr-2" />
                              Applicants
                            </Button>
                          </Link>
                          <Link href={`/dashboard/employer/listings/edit/${listing.id}`}>
                            <Button variant="outline" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          {status !== "closed" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Close this listing?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will stop accepting new applications.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleCloseListing(listing.id)}>
                                    Close
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
