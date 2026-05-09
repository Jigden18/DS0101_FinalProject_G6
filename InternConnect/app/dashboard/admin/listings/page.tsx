"use client"

import { useState } from "react"
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
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { listings, getEmployerById } from "@/lib/mock-data"

export default function AdminListingsPage() {
  const [removedListings, setRemovedListings] = useState<Set<string>>(new Set())

  const handleRemove = (listingId: string) => {
    setRemovedListings(prev => new Set([...prev, listingId]))
    toast.success("Listing removed successfully!")
  }

  const visibleListings = listings.filter(l => !removedListings.has(l.id))

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Listings Moderation</h1>
        <p className="text-muted-foreground mt-2">
          Review and moderate job listings across the platform
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Listings</CardTitle>
          <CardDescription>
            Monitor and remove inappropriate or policy-violating listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {visibleListings.length === 0 ? (
            <EmptyState
              type="listings"
              title="No listings to moderate"
              description="There are no listings in the system at the moment."
            />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Employer</TableHead>
                      <TableHead>Posted Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleListings.map((listing) => {
                      const employer = getEmployerById(listing.employerId)
                      return (
                        <TableRow key={listing.id}>
                          <TableCell className="font-medium">{listing.title}</TableCell>
                          <TableCell>{employer?.companyName || "Unknown"}</TableCell>
                          <TableCell>{new Date(listing.postedDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <StatusBadge status={listing.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Remove
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove this listing?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove &quot;{listing.title}&quot;? 
                                    This action cannot be undone. The employer will be notified.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRemove(listing.id)}>
                                    Remove Listing
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {visibleListings.map((listing) => {
                  const employer = getEmployerById(listing.employerId)
                  return (
                    <Card key={listing.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="font-medium">{listing.title}</p>
                            <p className="text-sm text-muted-foreground">{employer?.companyName}</p>
                          </div>
                          <StatusBadge status={listing.status} />
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Posted {new Date(listing.postedDate).toLocaleDateString()}
                        </p>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="w-full text-destructive">
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove Listing
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove this listing?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove &quot;{listing.title}&quot;? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemove(listing.id)}>
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
