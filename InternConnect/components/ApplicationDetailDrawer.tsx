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
import { StatusBadge } from "@/components/StatusBadge"
import { Application, getListingById, getEmployerById } from "@/lib/mock-data"
import { MapPin, Clock, DollarSign, Calendar, Building2 } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ApplicationDetailDrawerProps {
  application: Application | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ApplicationDetailDrawer({
  application,
  open,
  onOpenChange,
}: ApplicationDetailDrawerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (!application) return null

  const listing = getListingById(application.listingId)
  const employer = listing ? getEmployerById(listing.employerId) : null

  if (!listing || !employer) return null

  const content = (
    <div className="flex flex-col gap-6 p-4 md:p-0">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={employer.logo} alt={employer.companyName} />
          <AvatarFallback>{employer.companyName.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{employer.companyName}</h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            {employer.location}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <Building2 className="h-4 w-4" />
            {employer.industry}
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-lg mb-2">{listing.title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{listing.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{listing.workHours}/day</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span>{listing.stipend}</span>
        </div>
        <div className="flex items-center gap-2 text-sm col-span-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>Deadline: {new Date(listing.deadline).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Application Status</span>
          <StatusBadge status={application.status} />
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
            <SheetTitle>Application Details</SheetTitle>
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
          <DrawerTitle>Application Details</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto pb-8">{content}</div>
      </DrawerContent>
    </Drawer>
  )
}
