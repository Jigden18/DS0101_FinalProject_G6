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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/StatusBadge"
import { EmptyState } from "@/components/EmptyState"
import { ApplicationDetailDrawer } from "@/components/ApplicationDetailDrawer"
import { Briefcase } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { 
  applications, 
  getListingById, 
  getEmployerById,
  Application 
} from "@/lib/mock-data"

type StatusFilter = "all" | "submitted" | "under_review" | "accepted" | "rejected"

export default function StudentDashboardPage() {
  const { currentStudent } = useAuth()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Get applications for the current student (or first student if using role switcher)
  const studentId = currentStudent?.id || "student-1"
  const studentApplications = applications.filter(app => app.studentId === studentId)

  const filteredApplications = studentApplications.filter((app) => {
    if (statusFilter === "all") return true
    return app.status === statusFilter
  })

  const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "under_review", label: "Under Review" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
  ]

  const handleViewDetails = (application: Application) => {
    setSelectedApplication(application)
    setDrawerOpen(true)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
          <p className="text-muted-foreground mt-2">
            Track the status of your job applications
          </p>
        </div>
        <Link href="/listings">
          <Button>
            <Briefcase className="mr-2 h-4 w-4" />
            Browse Listings
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Tracker</CardTitle>
          <CardDescription>
            View all your submitted applications and their current status
          </CardDescription>
          
          {/* Status Filter Pills */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {statusFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(filter.value)}
                className="flex-shrink-0"
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          {filteredApplications.length === 0 ? (
            <EmptyState type="applications" />
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Date Applied</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => {
                      const listing = getListingById(application.listingId)
                      const employer = listing ? getEmployerById(listing.employerId) : null
                      
                      if (!listing || !employer) return null

                      return (
                        <TableRow key={application.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={employer.logo} alt={employer.companyName} />
                                <AvatarFallback className="text-xs">
                                  {employer.companyName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{employer.companyName}</span>
                            </div>
                          </TableCell>
                          <TableCell>{listing.title}</TableCell>
                          <TableCell>
                            {new Date(application.appliedDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={application.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewDetails(application)}
                            >
                              View Details
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
                {filteredApplications.map((application) => {
                  const listing = getListingById(application.listingId)
                  const employer = listing ? getEmployerById(listing.employerId) : null
                  
                  if (!listing || !employer) return null

                  return (
                    <Card key={application.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={employer.logo} alt={employer.companyName} />
                              <AvatarFallback>
                                {employer.companyName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{listing.title}</p>
                              <p className="text-sm text-muted-foreground">{employer.companyName}</p>
                            </div>
                          </div>
                          <StatusBadge status={application.status} />
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Applied {new Date(application.appliedDate).toLocaleDateString()}
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm"
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

      <ApplicationDetailDrawer
        application={selectedApplication}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}
