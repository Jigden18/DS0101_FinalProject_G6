"use client"

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { StatusBadge, ApplicationStatus } from "@/components/StatusBadge"
import { Application, getStudentById } from "@/lib/mock-data"
import { GraduationCap, Mail, Calendar, FileText, Download } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

interface StudentDetailDrawerProps {
  application: Application | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StudentDetailDrawer({
  application,
  open,
  onOpenChange,
}: StudentDetailDrawerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (!application) return null

  const student = getStudentById(application.studentId)

  if (!student) return null

  const content = (
    <div className="flex flex-col gap-6 p-4 md:p-0">
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-24 w-24 mb-4">
          <AvatarImage src={student.avatar} alt={student.name} />
          <AvatarFallback className="text-xl">
            {student.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-xl">{student.name}</h3>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
          <Mail className="h-4 w-4" />
          {student.email}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{student.university}</p>
            <p className="text-sm text-muted-foreground">{student.course}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm">Graduating {student.graduationYear}</p>
        </div>
      </div>

      <div className="pt-4 border-t">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Cover Letter
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed bg-muted/50 p-3 rounded-lg">
          {application.coverLetter}
        </p>
      </div>

      <div className="pt-4 border-t">
        <Button variant="outline" className="w-full gap-2">
          <Download className="h-4 w-4" />
          Download Resume ({application.resumeFileName})
        </Button>
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Application Status</span>
          <StatusBadge status={application.status as ApplicationStatus} />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-muted-foreground">Applied on</span>
          <span className="text-sm">{new Date(application.appliedDate).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[420px] sm:max-w-[420px]">
          <SheetHeader>
            <SheetTitle>Applicant Details</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{content}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Applicant Details</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto pb-8">{content}</div>
      </DrawerContent>
    </Drawer>
  )
}
