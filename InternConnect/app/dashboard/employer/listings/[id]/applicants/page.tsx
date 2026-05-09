"use client"

import { useState, use } from "react"
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
import { StatusBadge, ApplicationStatus } from "@/components/StatusBadge"
import { StudentDetailDrawer } from "@/components/StudentDetailDrawer"
import { EmptyState } from "@/components/EmptyState"
import { ArrowLeft, Download } from "lucide-react"
import { toast } from "sonner"
import { 
  getListingById, 
  getApplicationsByListing, 
  getStudentById,
  Application 
} from "@/lib/mock-data"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ApplicantsPage({ params }: PageProps) {
  const { id } = use(params)
  const listing = getListingById(id)
  const applications = getApplicationsByListing(id)

  const [statusMap, setStatusMap] = useState<Record<string, ApplicationStatus>>({})
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleStatusChange = (applicationId: string, newStatus: ApplicationStatus) => {
    setStatusMap((prev) => ({
      ...prev,
      [applicationId]: newStatus,
    }))
    toast.success("Application status updated!")
  }

  const getStatus = (application: Application): ApplicationStatus => {
    return (statusMap[application.id] || application.status) as ApplicationStatus
  }

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application)
    setDrawerOpen(true)
  }

  if (!listing) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Listing not found</p>
            <div className="flex justify-center mt-4">
              <Link href="/dashboard/employer">
                <Button>Back to Listings</Button>
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
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Listings
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Applicants</h1>
        <p className="text-muted-foreground mt-2">
          Review applicants for: {listing.title}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Applicant Review</CardTitle>
          <CardDescription>
            Update application statuses and view applicant details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <EmptyState type="applicants" />
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
                      const student = getStudentById(application.studentId)
                      if (!student) return null

                      return (
                        <TableRow key={application.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={student.avatar} alt={student.name} />
                                <AvatarFallback className="text-xs">
                                  {student.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{student.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{new Date(application.appliedDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Select
                              value={getStatus(application)}
                              onValueChange={(value) =>
                                handleStatusChange(application.id, value as ApplicationStatus)
                              }
                            >
                              <SelectTrigger className="w-[150px]">
                                <SelectValue>
                                  <StatusBadge status={getStatus(application)} />
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
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
                            >
                              View Details
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Resume
                            </Button>
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
                  const student = getStudentById(application.studentId)
                  if (!student) return null

                  return (
                    <Card key={application.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3 mb-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={student.avatar} alt={student.name} />
                            <AvatarFallback>
                              {student.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm text-muted-foreground">
                            Applied {new Date(application.appliedDate).toLocaleDateString()}
                          </span>
                          <StatusBadge status={getStatus(application)} />
                        </div>

                        <div className="space-y-2">
                          <Select
                            value={getStatus(application)}
                            onValueChange={(value) =>
                              handleStatusChange(application.id, value as ApplicationStatus)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Update status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="under_review">Under Review</SelectItem>
                              <SelectItem value="accepted">Accepted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handleViewDetails(application)}
                          >
                            View Details
                          </Button>
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
