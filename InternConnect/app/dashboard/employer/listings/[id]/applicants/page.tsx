"use client"

import { useState, useEffect, use } from "react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/StatusBadge"
import { StudentDetailDrawer } from "@/components/StudentDetailDrawer"
import { EmptyState } from "@/components/EmptyState"
import { ArrowLeft, Download, Loader2 } from "lucide-react"
import { 
  getListing, 
  getApplicants, 
  updateApplicationStatus 
} from "@/lib/api-client"
import { toast } from "sonner"
import { safeToastError, safeToastSuccess } from "@/lib/toast-helper"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ApplicantsPage({ params }: PageProps) {
  const { id } = use(params)
  
  const [listing, setListing] = useState<any | null>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const listingRes = await getListing(id)
      if (listingRes.error) {
        setError(listingRes.error)
        setIsLoading(false)
        return
      }
      setListing(listingRes.data)

      const applicantsRes = await getApplicants(id)
      if (applicantsRes.data && applicantsRes.data.applicants) {
        setApplications(applicantsRes.data.applicants)
      } else {
        setApplications([])
      }
    } catch (err) {
      setError("Failed to load applicants information")
      toast.error("Failed to load applicants")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [id])

  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    setUpdatingId(applicationId)
    try {
      const backendStatus = newStatus.toUpperCase()
      const { error } = await updateApplicationStatus(applicationId, backendStatus)
      if (error) {
        safeToastError(error)
      } else {
        safeToastSuccess("Application status updated!")
        // Update local state instead of full reload for premium micro-interaction
        setApplications(prev =>
          prev.map(app =>
            app.id === applicationId ? { ...app, status: backendStatus } : app
          )
        )
      }
    } catch (err) {
      safeToastError("Failed to update status")
    } finally {
      setUpdatingId(null)
    }
  }

  const handleViewDetails = (application: any) => {
    setSelectedApplication(application)
    setDrawerOpen(true)
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading applicants...</p>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive font-medium">Error: {error || "Listing not found"}</p>
            <div className="flex justify-center mt-4">
              <Link href="/dashboard/employer">
                <Button variant="outline">Back to Listings</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/dashboard/employer"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Listings
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Applicants</h1>
        <p className="text-muted-foreground mt-2">
          Review applicants for: <span className="font-semibold text-foreground">{listing.title}</span>
        </p>
      </div>

      <Card className="shadow-lg border-muted/60">
        <CardHeader className="pb-4">
          <CardTitle>Applicant Review</CardTitle>
          <CardDescription>
            Update application statuses and view detailed student profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <div className="py-12">
              <EmptyState type="applicants" />
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Date Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>View Details</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => {
                      const student = application.student
                      if (!student) return null

                      const initials = student.fullName
                        ? student.fullName
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase()
                        : "ST"

                      const isUpdating = updatingId === application.id

                      return (
                        <TableRow key={application.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9 border border-muted-foreground/10">
                                <AvatarImage src={student.avatarUrl} alt={student.fullName} />
                                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                                  {initials}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-foreground">{student.fullName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">{student.user?.email || "N/A"}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(application.appliedDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={application.status.toLowerCase()}
                              onValueChange={(value) =>
                                handleStatusChange(application.id, value)
                              }
                              disabled={isUpdating}
                            >
                              <SelectTrigger className="w-[160px] h-9">
                                <SelectValue>
                                  {isUpdating ? (
                                    <div className="flex items-center gap-2">
                                      <Loader2 className="h-3 w-3 animate-spin" />
                                      <span>Updating...</span>
                                    </div>
                                  ) : (
                                    <StatusBadge status={application.status} />
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="submitted">Submitted</SelectItem>
                                <SelectItem value="under_review">Under Review</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewDetails(application)}
                              className="hover:bg-primary/5 hover:text-primary transition-colors"
                            >
                              View Details
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            {application.resumeUrl ? (
                              <Button variant="outline" size="sm" asChild className="hover:bg-muted/50">
                                <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4 mr-2 text-primary" />
                                  Resume
                                </a>
                              </Button>
                            ) : (
                              <span className="text-xs text-muted-foreground">No Resume</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {applications.map((application) => {
                  const student = application.student
                  if (!student) return null

                  const initials = student.fullName
                    ? student.fullName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                    : "ST"

                  const isUpdating = updatingId === application.id

                  return (
                    <Card key={application.id} className="shadow-sm hover:shadow border-muted/80 transition-shadow">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3 mb-4">
                          <Avatar className="h-10 w-10 border border-muted-foreground/10">
                            <AvatarImage src={student.avatarUrl} alt={student.fullName} />
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{student.fullName}</p>
                            <p className="text-xs text-muted-foreground">{student.user?.email || "N/A"}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {student.university || "N/A"}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4 border-t border-b border-muted/50 py-2">
                          <span className="text-xs text-muted-foreground">
                            Applied {new Date(application.appliedDate).toLocaleDateString()}
                          </span>
                          <StatusBadge status={application.status} />
                        </div>

                        <div className="space-y-2">
                          <Select
                            value={application.status.toLowerCase()}
                            onValueChange={(value) =>
                              handleStatusChange(application.id, value)
                            }
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Update status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="submitted">Submitted</SelectItem>
                              <SelectItem value="under_review">Under Review</SelectItem>
                              <SelectItem value="accepted">Accepted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1"
                              onClick={() => handleViewDetails(application)}
                            >
                              View Details
                            </Button>
                            {application.resumeUrl && (
                              <Button variant="outline" className="px-3" asChild>
                                <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer">
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </div>
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

      <StudentDetailDrawer
        application={selectedApplication}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}
