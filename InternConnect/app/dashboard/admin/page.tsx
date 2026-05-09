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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusBadge } from "@/components/StatusBadge"
import { EmptyState } from "@/components/EmptyState"
import { Check, X, UserX } from "lucide-react"
import { toast } from "sonner"
import { students, employers, pendingEmployers } from "@/lib/mock-data"

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState("pending")
  const [approvedEmployers, setApprovedEmployers] = useState<Set<string>>(new Set())
  const [rejectedEmployers, setRejectedEmployers] = useState<Set<string>>(new Set())
  const [deactivatedUsers, setDeactivatedUsers] = useState<Set<string>>(new Set())

  const handleApprove = (employerId: string) => {
    setApprovedEmployers(prev => new Set([...prev, employerId]))
    toast.success("Employer approved successfully!")
  }

  const handleReject = (employerId: string) => {
    setRejectedEmployers(prev => new Set([...prev, employerId]))
    toast.success("Employer rejected")
  }

  const handleDeactivate = (userId: string) => {
    setDeactivatedUsers(prev => new Set([...prev, userId]))
    toast.success("User deactivated successfully!")
  }

  const visiblePendingEmployers = pendingEmployers.filter(
    e => !approvedEmployers.has(e.id) && !rejectedEmployers.has(e.id)
  )

  const getUserStatus = (userId: string, originalStatus: string) => {
    if (deactivatedUsers.has(userId)) return "inactive"
    return originalStatus as "active" | "inactive" | "pending"
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">User Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage students, employers, and pending approvals
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 overflow-x-auto flex-wrap h-auto">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="employers">Employers</TabsTrigger>
          <TabsTrigger value="pending">
            Pending Approvals
            {visiblePendingEmployers.length > 0 && (
              <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {visiblePendingEmployers.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Students Tab */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <CardTitle>Students</CardTitle>
              <CardDescription>View and manage registered students</CardDescription>
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
                            <TableRow key={student.id}>
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
                              <TableCell>{student.university}</TableCell>
                              <TableCell>{new Date(student.joinedDate).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <StatusBadge status={status} />
                              </TableCell>
                              <TableCell className="text-right">
                                {status === "active" && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="outline" className="text-destructive">
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
                        <Card key={student.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3 mb-3">
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
                              <StatusBadge status={status} />
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{student.university}</p>
                            {status === "active" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="w-full text-destructive">
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
          <Card>
            <CardHeader>
              <CardTitle>Employers</CardTitle>
              <CardDescription>View and manage registered employers</CardDescription>
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
                            <TableRow key={employer.id}>
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
                              <TableCell>{employer.email}</TableCell>
                              <TableCell>{employer.industry}</TableCell>
                              <TableCell>{new Date(employer.joinedDate).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <StatusBadge status={status} />
                              </TableCell>
                              <TableCell className="text-right">
                                {status === "active" && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button size="sm" variant="outline" className="text-destructive">
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
                        <Card key={employer.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3 mb-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={employer.logo} alt={employer.companyName} />
                                <AvatarFallback>
                                  {employer.companyName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium">{employer.companyName}</p>
                                <p className="text-sm text-muted-foreground">{employer.email}</p>
                              </div>
                              <StatusBadge status={status} />
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{employer.industry}</p>
                            {status === "active" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="w-full text-destructive">
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

        {/* Pending Approvals Tab */}
        <TabsContent value="pending">
          <Card>
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
                          <TableRow key={employer.id}>
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
                            <TableCell>{employer.contactPerson}</TableCell>
                            <TableCell>{employer.email}</TableCell>
                            <TableCell>{new Date(employer.joinedDate).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-green-600"
                                  onClick={() => handleApprove(employer.id)}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="text-destructive">
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
                      <Card key={employer.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-3 mb-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={employer.logo} alt={employer.companyName} />
                              <AvatarFallback>
                                {employer.companyName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{employer.companyName}</p>
                              <p className="text-sm text-muted-foreground">{employer.contactPerson}</p>
                              <p className="text-sm text-muted-foreground">{employer.email}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 text-green-600"
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
      </Tabs>
    </div>
  )
}
