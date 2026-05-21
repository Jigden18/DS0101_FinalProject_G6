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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusBadge, StatusType } from "@/components/StatusBadge"
import { EmptyState } from "@/components/EmptyState"
import { ApplicationDetailDrawer } from "@/components/ApplicationDetailDrawer"
import { Briefcase, Loader2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { getApplications } from "@/lib/api-client"

type StatusFilter = "all" | StatusType

interface Application {
  id: string
  listingId: string
  coverLetter: string
  resumeFileName: string
  appliedDate: string
  status: StatusType
  listing?: {
    id: string
    title: string
    employer?: {
      companyName: string
      logoUrl?: string
    }
  }
  employer?: {
    companyName: string
    logoUrl?: string
  }
}

export default function StudentDashboardPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchApplications = async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await getApplications()
      if (fetchError) {
        setError(fetchError)
      } else if (data) {
        const apps = Array.isArray(data)
          ? data
          : (data && Array.isArray(data.applications)
            ? data.applications
            : [])
        setApplications(apps.map((app: any) => ({
          ...app,
          employer: app.employer || app.listing?.employer,
        })))
      }
    } catch (err) {
      setError("Failed to fetch applications")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      fetchApplications()
    }
  }, [user, authLoading])

  const filteredApplications = applications.filter((app) => {
    if (statusFilter === "all") return true
    return app.status?.toLowerCase() === statusFilter
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

      {error && (
        <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

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
                    {filteredApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={application.employer?.logoUrl} alt={application.employer?.companyName} />
                              <AvatarFallback className="text-xs">
                                {application.employer?.companyName?.slice(0, 2).toUpperCase() || "CO"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{application.employer?.companyName || "Company"}</span>
                          </div>
                        </TableCell>
                        <TableCell>{application.listing?.title || "Job"}</TableCell>
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
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {filteredApplications.map((application) => (
                  <Card key={application.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={application.employer?.logoUrl} alt={application.employer?.companyName} />
                            <AvatarFallback>
                              {application.employer?.companyName?.slice(0, 2).toUpperCase() || "CO"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{application.listing?.title || "Job"}</p>
                            <p className="text-sm text-muted-foreground">{application.employer?.companyName || "Company"}</p>
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
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ApplicationDetailDrawer
        application={selectedApplication}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onWithdraw={fetchApplications}
      />
    </div>
  )
}
