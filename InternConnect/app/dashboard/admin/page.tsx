"use client"

import { useState, useEffect } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/StatusBadge"
import { EmptyState } from "@/components/EmptyState"
import { Check, X, UserX, UserCheck, Loader2, BarChart3, ShieldAlert, Sparkles, TrendingUp, Users } from "lucide-react"
import { safeToastError, safeToastSuccess } from "@/lib/toast-helper"
import { 
  getUsers, 
  getPendingEmployers, 
  approveEmployer, 
  rejectEmployer, 
  deactivateUser,
  reactivateUser,
  getAnalytics,
  getAuditLogs
} from "@/lib/api-client"

interface Student {
  id: string
  name: string
  email: string
  university: string
  joinedDate: string
  status: "active" | "inactive"
  avatar: string
}

interface Employer {
  id: string
  companyName: string
  email: string
  industry: string
  joinedDate: string
  status: "active" | "inactive" | "pending"
  logo: string
}

interface PendingEmployer {
  id: string
  companyName: string
  contactPerson: string
  email: string
  joinedDate: string
  logo: string
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("pending")
  const [students, setStudents] = useState<Student[]>([])
  const [employers, setEmployers] = useState<Employer[]>([])
  const [pendingEmployers, setPendingEmployers] = useState<PendingEmployer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Analytics & Audit state
  const [analytics, setAnalytics] = useState<any | null>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState(false)
  const [isAuditLogsLoading, setIsAuditLogsLoading] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [usersRes, pendingRes] = await Promise.all([
        getUsers(),
        getPendingEmployers()
      ])

      if (usersRes.error) {
        setError(usersRes.error)
        return
      }
      if (pendingRes.error) {
        setError(pendingRes.error)
        return
      }

      const allUsers = Array.isArray(usersRes.data?.users) ? usersRes.data.users : []
      const allPending = Array.isArray(pendingRes.data?.pending_employers) ? pendingRes.data.pending_employers : []

      const studentsList = allUsers.filter((u: any) => u.role === "STUDENT").map((u: any) => ({
        id: u.id,
        name: u.name || "Unknown",
        email: u.email,
        university: u.university || "Unknown",
        joinedDate: u.createdAt,
        status: (u.status?.toLowerCase() === "active" ? "active" : "inactive") as "active" | "inactive",
        avatar: u.avatar || ""
      }))

      const employersList = allUsers.filter((u: any) => u.role === "EMPLOYER" && u.status !== "PENDING").map((u: any) => ({
        id: u.id,
        companyName: u.name || "Unknown",
        email: u.email,
        industry: u.industry || "Unknown",
        joinedDate: u.createdAt,
        status: u.status?.toLowerCase() as "active" | "inactive" | "pending",
        logo: u.avatar || ""
      }))

      const pendingList = allPending.map((e: any) => ({
        id: e.id,
        companyName: e.employer?.companyName || "Unknown",
        contactPerson: e.employer?.contactPerson || "Unknown",
        email: e.email,
        joinedDate: e.createdAt,
        logo: e.employer?.logoUrl || ""
      }))

      setStudents(studentsList)
      setEmployers(employersList)
      setPendingEmployers(pendingList)
    } catch (err) {
      setError("An unexpected error occurred while loading data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Lazy loading of Analytics and Audit Logs on tab switch
  useEffect(() => {
    if (activeTab === "analytics") {
      const fetchAnalyticsData = async () => {
        setIsAnalyticsLoading(true)
        try {
          const { data, error } = await getAnalytics()
          if (data && !error) {
            setAnalytics(data.analytics)
          } else if (error) {
            safeToastError(error)
          }
        } catch (err) {
          safeToastError("Failed to load analytics")
        } finally {
          setIsAnalyticsLoading(false)
        }
      }
      fetchAnalyticsData()
    } else if (activeTab === "audit-logs") {
      const fetchAuditLogsData = async () => {
        setIsAuditLogsLoading(true)
        try {
          const { data, error } = await getAuditLogs()
          if (data && !error) {
            setAuditLogs(Array.isArray(data.logs) ? data.logs : [])
          } else if (error) {
            safeToastError(error)
          }
        } catch (err) {
          safeToastError("Failed to load audit logs")
        } finally {
          setIsAuditLogsLoading(false)
        }
      }
      fetchAuditLogsData()
    }
  }, [activeTab])

  const handleApprove = async (employerId: string) => {
    try {
      const { error } = await approveEmployer(employerId)
      if (error) {
        safeToastError(error)
      } else {
        safeToastSuccess("Employer approved successfully!")
        fetchData()
      }
    } catch (err) {
      safeToastError("Failed to approve employer")
    }
  }

  const handleReject = async (employerId: string) => {
    try {
      const { error } = await rejectEmployer(employerId)
      if (error) {
        safeToastError(error)
      } else {
        safeToastSuccess("Employer rejected successfully!")
        fetchData()
      }
    } catch (err) {
      safeToastError("Failed to reject employer")
    }
  }

  const handleDeactivate = async (userId: string) => {
    try {
      const { error } = await deactivateUser(userId)
      if (error) {
        safeToastError(error)
      } else {
        safeToastSuccess("User deactivated successfully!")
        fetchData()
      }
    } catch (err) {
      safeToastError("Failed to deactivate user")
    }
  }

  const handleReactivate = async (userId: string) => {
    try {
      const { error } = await reactivateUser(userId)
      if (error) {
        safeToastError(error)
      } else {
        safeToastSuccess("User reactivated successfully!")
        fetchData()
      }
    } catch (err) {
      safeToastError("Failed to reactivate user")
    }
  }

  const visiblePendingEmployers = pendingEmployers

  const getUserStatus = (userId: string, originalStatus: string) => {
    return originalStatus as "active" | "inactive" | "pending"
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in-50 duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Admin Operations</h1>
        <p className="text-muted-foreground mt-2">
          Deactivate/reactivate users, review signups, verify logs, and monitor analytics.
        </p>
      </div>

      {error && (
        <Card className="mb-6 border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 overflow-x-auto flex-wrap h-auto gap-1 bg-muted p-1 rounded-lg">
          <TabsTrigger value="pending" className="px-4 py-2">
            Pending Approvals
            {visiblePendingEmployers.length > 0 && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                {visiblePendingEmployers.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="students" className="px-4 py-2">Students</TabsTrigger>
          <TabsTrigger value="employers" className="px-4 py-2">Employers</TabsTrigger>
          <TabsTrigger value="analytics" className="px-4 py-2 flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="audit-logs" className="px-4 py-2 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        {/* Pending Approvals Tab */}
        <TabsContent value="pending">
          <Card className="shadow-sm border-muted/70">
            <CardHeader>
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Review and approve new employer registration requests</CardDescription>
            </CardHeader>
            <CardContent>
              {visiblePendingEmployers.length === 0 ? (
                <EmptyState type="users" title="No pending approvals" description="All registration requests have been processed." />
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead>Contact Person</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Registered Date</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visiblePendingEmployers.map((employer) => (
                          <TableRow key={employer.id} className="hover:bg-muted/20 transition-colors">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={employer.logo} alt={employer.companyName} />
                                  <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                                    {employer.companyName.slice(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{employer.companyName}</span>
                              </div>
                            </TableCell>
                            <TableCell>{employer.contactPerson}</TableCell>
                            <TableCell>{employer.email}</TableCell>
                            <TableCell>{new Date(employer.joinedDate).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-green-600 border-green-600/30 hover:bg-green-50 hover:text-green-700 transition-all"
                                  onClick={() => handleApprove(employer.id)}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/5 hover:text-destructive transition-all">
                                      <X className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Reject this employer?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will deny {employer.companyName}&apos;s registration request.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleReject(employer.id)}>
                                        Reject
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {visiblePendingEmployers.map((employer) => (
                      <Card key={employer.id} className="border-muted/80">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3 mb-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={employer.logo} alt={employer.companyName} />
                              <AvatarFallback>
                                {employer.companyName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{employer.companyName}</p>
                              <p className="text-sm text-muted-foreground">{employer.contactPerson}</p>
                              <p className="text-sm text-muted-foreground">{employer.email}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 text-green-600 border-green-600/30 hover:bg-green-50"
                              onClick={() => handleApprove(employer.id)}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="flex-1 text-destructive">
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Reject this employer?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will deny {employer.companyName}&apos;s registration request.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleReject(employer.id)}>
                                    Reject
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students">
          <Card className="shadow-sm border-muted/70">
            <CardHeader>
              <CardTitle>Students</CardTitle>
              <CardDescription>View, deactivate, or reactivate student accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <EmptyState type="users" title="No students registered" />
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>University</TableHead>
                          <TableHead>Joined Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => {
                          const status = getUserStatus(student.id, student.status)
                          return (
                            <TableRow key={student.id} className="hover:bg-muted/20 transition-colors">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={student.avatar} alt={student.name} />
                                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                                      {student.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-foreground">{student.name}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{student.email}</TableCell>
                              <TableCell className="text-muted-foreground">{student.university}</TableCell>
                              <TableCell className="text-muted-foreground">{new Date(student.joinedDate).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <StatusBadge status={status} />
                              </TableCell>
                              <TableCell className="text-right">
                                {status === "active" ? (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/5 border-destructive/20">
                                        <UserX className="h-4 w-4 mr-1" />
                                        Deactivate
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Deactivate user?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will prevent {student.name} from accessing their account.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeactivate(student.id)}>
                                          Deactivate
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                ) : (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="outline" className="text-green-600 border-green-600/30 hover:bg-green-50 hover:text-green-700">
                                        <UserCheck className="h-4 w-4 mr-1" />
                                        Reactivate
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Reactivate user?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will restore account access for {student.name}.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleReactivate(student.id)}>
                                          Reactivate
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
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
                    {students.map((student) => {
                      const status = getUserStatus(student.id, student.status)
                      return (
                        <Card key={student.id} className="border-muted/80">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3 mb-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={student.avatar} alt={student.name} />
                                <AvatarFallback>
                                  {student.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-semibold text-foreground">{student.name}</p>
                                <p className="text-xs text-muted-foreground">{student.email}</p>
                              </div>
                              <StatusBadge status={status} />
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">{student.university}</p>
                            {status === "active" ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="w-full text-destructive border-destructive/20 hover:bg-destructive/5">
                                    <UserX className="h-4 w-4 mr-1" />
                                    Deactivate
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Deactivate user?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will prevent {student.name} from accessing their account.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeactivate(student.id)}>
                                      Deactivate
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="w-full text-green-600 border-green-600/30 hover:bg-green-50">
                                    <UserCheck className="h-4 w-4 mr-1" />
                                    Reactivate
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reactivate user?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will restore account access for {student.name}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleReactivate(student.id)}>
                                      Reactivate
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employers Tab */}
        <TabsContent value="employers">
          <Card className="shadow-sm border-muted/70">
            <CardHeader>
              <CardTitle>Employers</CardTitle>
              <CardDescription>View, deactivate, or reactivate employer accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {employers.length === 0 ? (
                <EmptyState type="users" title="No employers registered" />
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Company</TableHead>
                          <TableHead>Contact Email</TableHead>
                          <TableHead>Industry</TableHead>
                          <TableHead>Joined Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employers.map((employer) => {
                          const status = getUserStatus(employer.id, employer.status)
                          return (
                            <TableRow key={employer.id} className="hover:bg-muted/20 transition-colors">
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={employer.logo} alt={employer.companyName} />
                                    <AvatarFallback className="text-xs font-bold bg-primary/10 text-primary">
                                      {employer.companyName.slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium text-foreground">{employer.companyName}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">{employer.email}</TableCell>
                              <TableCell className="text-muted-foreground">{employer.industry}</TableCell>
                              <TableCell className="text-muted-foreground">{new Date(employer.joinedDate).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <StatusBadge status={status} />
                              </TableCell>
                              <TableCell className="text-right">
                                {status === "active" ? (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="outline" className="text-destructive border-destructive/20 hover:bg-destructive/5">
                                        <UserX className="h-4 w-4 mr-1" />
                                        Deactivate
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Deactivate employer?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will prevent {employer.companyName} from accessing their account and posting listings.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeactivate(employer.id)}>
                                          Deactivate
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                ) : (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="outline" className="text-green-600 border-green-600/30 hover:bg-green-50 hover:text-green-700">
                                        <UserCheck className="h-4 w-4 mr-1" />
                                        Reactivate
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Reactivate employer?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          This will restore account access for {employer.companyName}.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleReactivate(employer.id)}>
                                          Reactivate
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
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
                    {employers.map((employer) => {
                      const status = getUserStatus(employer.id, employer.status)
                      return (
                        <Card key={employer.id} className="border-muted/80">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3 mb-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={employer.logo} alt={employer.companyName} />
                                <AvatarFallback>
                                  {employer.companyName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-semibold text-foreground">{employer.companyName}</p>
                                <p className="text-xs text-muted-foreground">{employer.email}</p>
                              </div>
                              <StatusBadge status={status} />
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">{employer.industry}</p>
                            {status === "active" ? (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="w-full text-destructive border-destructive/20 hover:bg-destructive/5">
                                    <UserX className="h-4 w-4 mr-1" />
                                    Deactivate
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Deactivate employer?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will prevent {employer.companyName} from accessing their account.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeactivate(employer.id)}>
                                      Deactivate
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            ) : (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="w-full text-green-600 border-green-600/30 hover:bg-green-50">
                                    <UserCheck className="h-4 w-4 mr-1" />
                                    Reactivate
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Reactivate employer?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will restore account access for {employer.companyName}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleReactivate(employer.id)}>
                                      Reactivate
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card className="shadow-sm border-muted/70">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle>System Performance & Analytics</CardTitle>
                  <CardDescription>Live telemetry and statistics of InternConnect portal</CardDescription>
                </div>
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              {isAnalyticsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Compiling metrics...</p>
                </div>
              ) : analytics ? (
                <div className="space-y-8">
                  {/* Grid Counters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-primary/[0.02] border-primary/10">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-muted-foreground">Active Students</p>
                          <Users className="h-5 w-5 text-primary/80" />
                        </div>
                        <p className="text-3xl font-extrabold text-foreground mt-3">{analytics.total_students}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">Verified user records</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-primary/[0.02] border-primary/10">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-muted-foreground">Active Employers</p>
                          <Building2 className="h-5 w-5 text-primary/80" />
                        </div>
                        <p className="text-3xl font-extrabold text-foreground mt-3">{analytics.total_employers}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">Approved corporate partners</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-primary/[0.02] border-primary/10">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-muted-foreground">Live Postings</p>
                          <TrendingUp className="h-5 w-5 text-primary/80" />
                        </div>
                        <p className="text-3xl font-extrabold text-foreground mt-3">
                          {analytics.active_listings}
                          <span className="text-sm font-normal text-muted-foreground ml-1.5">/ {analytics.total_listings} total</span>
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">Open internship positions</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-primary/[0.02] border-primary/10">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-muted-foreground">Total Applications</p>
                          <Check className="h-5 w-5 text-primary/80" />
                        </div>
                        <p className="text-3xl font-extrabold text-foreground mt-3">{analytics.total_applications}</p>
                        <p className="text-[11px] text-muted-foreground mt-1">Student submissions processed</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Secondary analytics section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Performance Metrics */}
                    <Card className="border-muted bg-muted/10">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-bold">Portal Efficiency</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-semibold text-muted-foreground">Application Success Rate</span>
                            <span className="font-extrabold text-foreground">{(analytics.application_success_rate * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-3.5 border border-muted/80 overflow-hidden">
                            <div 
                              className="bg-primary h-full rounded-full transition-all duration-500" 
                              style={{ width: `${Math.min(100, Math.max(0, analytics.application_success_rate * 100))}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                            Percentage of submitted internship applications that successfully transition to "Accepted" state by hiring managers.
                          </p>
                        </div>

                        <div className="pt-4 border-t border-muted flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-muted-foreground">New Signups This Month</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5">Rolling 30-day user growth tracking</p>
                          </div>
                          <span className="text-2xl font-black text-foreground bg-primary/5 border border-primary/10 px-3 py-1 rounded-lg">
                            +{analytics.new_users_this_month}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Trending Fields */}
                    <Card className="border-muted bg-muted/10">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-bold">Trending Internship Sectors</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground mb-4 leading-normal">
                          The most active job fields on our portal sorted by live opportunity volumes.
                        </p>
                        {analytics.trending_job_fields && analytics.trending_job_fields.length > 0 ? (
                          <div className="space-y-3.5">
                            {analytics.trending_job_fields.map((field: string, index: number) => (
                              <div key={field} className="flex items-center gap-3 bg-background border border-muted/50 p-2.5 rounded-lg">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                  {index + 1}
                                </span>
                                <span className="font-semibold text-sm text-foreground">{field}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic py-4">No active opportunities in trending sectors yet.</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6">Failed to assemble telemetry report.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit-logs">
          <Card className="shadow-sm border-muted/70">
            <CardHeader>
              <CardTitle>System Security & Audit Logs</CardTitle>
              <CardDescription>Immutable tracking logs of administrative and critical operations</CardDescription>
            </CardHeader>
            <CardContent>
              {isAuditLogsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Accessing security records...</p>
                </div>
              ) : auditLogs.length === 0 ? (
                <EmptyState type="listings" title="No logs recorded" description="Security registers are empty." />
              ) : (
                <div className="overflow-x-auto border border-muted rounded-lg shadow-inner max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0 z-10">
                      <TableRow>
                        <TableHead className="w-[180px]">Timestamp</TableHead>
                        <TableHead>Operator</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead className="max-w-[300px]">Metadata Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.map((log) => {
                        const formattedTime = new Date(log.timestamp).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })

                        const actionLabel = log.action
                          ?.replace(/_/g, " ")
                          ?.toLowerCase()
                          ?.replace(/\b\w/g, (char: string) => char.toUpperCase())

                        return (
                          <TableRow key={log.id} className="hover:bg-muted/10 font-mono text-xs">
                            <TableCell className="text-muted-foreground whitespace-nowrap">{formattedTime}</TableCell>
                            <TableCell className="font-semibold text-foreground whitespace-nowrap">
                              {log.user?.email || "System/Core"}
                            </TableCell>
                            <TableCell>
                              {log.user?.role ? (
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  log.user.role === 'ADMIN' 
                                    ? 'bg-red-100 text-red-800' 
                                    : log.user.role === 'EMPLOYER' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {log.user.role}
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-muted-foreground">SYSTEM</span>
                              )}
                            </TableCell>
                            <TableCell className="font-medium text-foreground whitespace-nowrap">{actionLabel}</TableCell>
                            <TableCell className="text-muted-foreground whitespace-nowrap">
                              {log.resourceType}
                              {log.resourceId && (
                                <span className="text-[10px] text-muted-foreground/60 block mt-0.5">
                                  ID: {log.resourceId.slice(0, 8)}...
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-muted-foreground max-w-[300px] truncate hover:text-foreground hover:whitespace-pre-wrap transition-all duration-150 select-all cursor-pointer">
                              {log.details ? JSON.stringify(log.details) : "{}"}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
