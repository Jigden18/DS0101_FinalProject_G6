"use client"

import { useState, useEffect } from "react"
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
import { StatusBadge } from "@/components/StatusBadge"
import { GraduationCap, Mail, Calendar, FileText, Download, Loader2 } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { getApplication } from "@/lib/api-client"

interface StudentDetailDrawerProps {
  application: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StudentDetailDrawer({
  application,
  open,
  onOpenChange,
}: StudentDetailDrawerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [fullApp, setFullApp] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open && application?.id) {
      const fetchFullDetails = async () => {
        setIsLoading(true)
        try {
          const { data, error } = await getApplication(application.id)
          if (data && !error) {
            setFullApp(data)
          } else {
            // Fallback to whatever parameters we already have
            setFullApp(application)
          }
        } catch (err) {
          console.error("Failed to fetch full application details", err)
          setFullApp(application)
        } finally {
          setIsLoading(false)
        }
      }
      fetchFullDetails()
    } else if (!open) {
      setFullApp(null)
    }
  }, [open, application])

  if (!application) return null

  // Use the loaded details if available, otherwise fallback to basic props
  const appData = fullApp || application
  const student = appData.student

  const initials = student?.fullName
    ? student.fullName.split(" ").map((n: string) => n[0]).join("").toUpperCase()
    : "ST"

  const content = (
    <div className="flex flex-col gap-6 p-4 md:p-0">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading profile details...</p>
        </div>
      ) : student ? (
        <>
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4 border border-muted-foreground/10 shadow-sm">
              <AvatarImage src={student.avatarUrl} alt={student.fullName} />
              <AvatarFallback className="text-xl font-semibold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-xl text-foreground">{student.fullName}</h3>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1.5 hover:text-foreground transition-colors">
              <Mail className="h-4 w-4 text-primary/75" />
              <a href={`mailto:${student.user?.email}`}>{student.user?.email || "N/A"}</a>
            </div>
          </div>

          <div className="space-y-4 bg-muted/30 p-4 rounded-xl border border-muted/50">
            <div className="flex items-start gap-3">
              <GraduationCap className="h-5 w-5 text-primary/80 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">{student.university || "N/A"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{student.course || "No Course Details"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary/80" />
              <p className="text-sm font-medium text-foreground">
                Graduation Year: <span className="font-normal text-muted-foreground">{student.graduationYear || "N/A"}</span>
              </p>
            </div>
            {student.skills && student.skills.length > 0 && (
              <div className="pt-2 border-t border-muted">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {student.skills.map((skill: string) => (
                    <span key={skill} className="px-2 py-0.5 bg-primary/5 border border-primary/10 rounded-full text-xs text-primary font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {student.bio && (
            <div className="pt-4 border-t border-muted">
              <h4 className="font-semibold text-sm mb-2 text-foreground">About Me</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {student.bio}
              </p>
            </div>
          )}

          <div className="pt-4 border-t border-muted">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2 text-foreground">
              <FileText className="h-4 w-4 text-primary" />
              Cover Letter
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed bg-muted/40 p-3.5 rounded-lg border border-muted/65 whitespace-pre-line">
              {appData.coverLetter || "No cover letter provided."}
            </p>
          </div>

          {appData.resumeUrl && (
            <div className="pt-4 border-t border-muted">
              <Button variant="outline" className="w-full gap-2 hover:bg-primary/5 hover:text-primary transition-all shadow-sm" asChild>
                <a href={appData.resumeUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4 text-primary" />
                  Download Resume ({appData.resumeFilename || "resume.pdf"})
                </a>
              </Button>
            </div>
          )}

          <div className="pt-4 border-t border-muted">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Application Status</span>
              <StatusBadge status={appData.status} />
            </div>
            <div className="flex items-center justify-between mt-2.5">
              <span className="text-xs text-muted-foreground">Applied on</span>
              <span className="text-xs font-medium text-foreground">
                {new Date(appData.appliedDate).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </>
      ) : (
        <p className="text-center text-muted-foreground py-6">Could not load applicant profile.</p>
      )}
    </div>
  )

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[440px] sm:max-w-[440px] overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="text-xl font-bold tracking-tight">Applicant Details</SheetTitle>
          </SheetHeader>
          <div className="mt-6">{content}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="pb-4 border-b">
          <DrawerTitle className="text-xl font-bold tracking-tight">Applicant Details</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto pb-8">{content}</div>
      </DrawerContent>
    </Drawer>
  )
}
