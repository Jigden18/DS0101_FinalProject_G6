"use client"

import { useState, useEffect } from "react"
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
import { Plus, Pencil, XCircle, Users, Loader2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { getMyListings, closeListing } from "@/lib/api-client"
import { safeToastError, safeToastSuccess } from "@/lib/toast-helper"

interface Listing {
  id: string
  title: string
  location: string
  workHours: string
  stipend: string
  deadline: string
  status: string
  applicants?: any[]
  _count?: {
    applications?: number
  }
}

export default function EmployerDashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [closingId, setClosingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchListings = async () => {
      if (!user) return
      
      setIsLoading(true)
      setError(null)
      
      try {
        const { data, error: fetchError } = await getMyListings()
        if (fetchError) {
          setError(fetchError)
        } else if (data) {
          setListings(Array.isArray(data.listings) ? data.listings : [])
        }
      } catch (err) {
        setError("Failed to fetch listings")
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading) {
      fetchListings()
    }
  }, [user, authLoading])

  const handleCloseListing = async (listingId: string) => {
    setClosingId(listingId)
    try {
      const { error } = await closeListing(listingId)
      if (error) {
        safeToastError(error)
      } else {
        safeToastSuccess("Listing closed successfully!")
        setListings(listings.map(l => 
          l.id === listingId ? { ...l, status: "CLOSED" } : l
        ))
      }
    } catch (err) {
      safeToastError("Failed to close listing")
    } finally {
      setClosingId(null)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
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

      {error && (
        <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Listing Management</CardTitle>
          <CardDescription>
            View, edit, and manage all your posted opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {listings.length === 0 ? (
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
                    {listings.map((listing) => {
                      const applicantCount = listing._count?.applications ?? listing.applicants?.length ?? 0
                      const status = listing.status
                      
                      return (
                        <TableRow key={listing.id}>
                          <TableCell className="font-medium">{listing.title}</TableCell>
                          <TableCell>{listing.location}</TableCell>
                          <TableCell>{listing.workHours}</TableCell>
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
                              {status !== "closed" && status !== "CLOSED" && (
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
                {listings.map((listing) => {
                  const applicantCount = listing._count?.applications ?? listing.applicants?.length ?? 0
                  const status = listing.status
                  
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
                          {status !== "closed" && status !== "CLOSED" && (
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
