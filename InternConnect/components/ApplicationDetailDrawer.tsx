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
  SheetDescription,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/StatusBadge"
import { MapPin, Clock, DollarSign, Calendar, Building2, Trash2, Loader2 } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { getApplication, getListing, withdrawApplication } from "@/lib/api-client"
import { toast } from "sonner"
import { safeToastError, safeToastSuccess } from "@/lib/toast-helper"

interface ApplicationDetailDrawerProps {
  application: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onWithdraw?: () => void
}

export function ApplicationDetailDrawer({
  application,
  open,
  onOpenChange,
  onWithdraw,
}: ApplicationDetailDrawerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [fullApp, setFullApp] = useState<any | null>(null)
  const [listing, setListing] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  useEffect(() => {
    if (open && application?.id) {
      const fetchAllDetails = async () => {
        setIsLoading(true)
        try {
          // Fetch the full application
          const { data: appData, error: appError } = await getApplication(application.id)
          if (appData && !appError) {
            setFullApp(appData)
            
            // Fetch listing & employer details using listingId
            const listingId = appData.listingId || application.listingId
            if (listingId) {
              const { data: listData } = await getListing(listingId)
              if (listData) {
                setListing(listData)
              }
            }
          } else {
            // Fallback
            setFullApp(application)
          }
        } catch (err) {
          console.error("Failed to load details", err)
          setFullApp(application)
        } finally {
          setIsLoading(false)
        }
      }
      fetchAllDetails()
    } else if (!open) {
      setFullApp(null)
      setListing(null)
    }
  }, [open, application])

  if (!application) return null

  // Use the loaded details if available, otherwise fallback to basic props
  const appData = fullApp || application
  // Get employer from listing details if fetched, otherwise from appData
  const listingData = listing || appData.listing
  const employer = listingData?.employer

  const handleWithdraw = async () => {
    if (!appData?.id) return
    setIsWithdrawing(true)
    try {
      const { error } = await withdrawApplication(appData.id)
      if (error) {
        safeToastError(error)
      } else {
        safeToastSuccess("Application withdrawn successfully!")
        onOpenChange(false)
        if (onWithdraw) {
          onWithdraw()
        }
      }
    } catch (err) {
      safeToastError("Failed to withdraw application")
    } finally {
      setIsWithdrawing(false)
    }
  }

  // Only allow withdrawal if status is SUBMITTED
  const canWithdraw = appData?.status?.toUpperCase() === "SUBMITTED"

  const content = (
    <div className="flex flex-col gap-6 p-4 md:p-0">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading details...</p>
        </div>
      ) : listingData && employer ? (
        <>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border border-muted shadow-sm">
              <AvatarImage src={employer.logoUrl || employer.logo} alt={employer.companyName} />
              <AvatarFallback className="bg-primary/5 text-primary text-sm font-semibold">
                {employer.companyName?.slice(0, 2).toUpperCase() || "CO"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground">{employer.companyName}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 text-primary/70" />
                {employer.location || listingData.location || "N/A"}
              </div>
              {employer.industry && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <Building2 className="h-3.5 w-3.5 text-primary/70" />
                  {employer.industry}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-muted pt-4">
            <h4 className="font-semibold text-lg text-foreground">{listingData.title}</h4>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed whitespace-pre-line bg-muted/20 p-3 rounded-lg border border-muted/30">
              {listingData.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-xl border border-muted/50">
            <div className="flex items-center gap-2.5 text-sm text-foreground">
              <Clock className="h-4.5 w-4.5 text-primary" />
              <span>{listingData.workHours || "N/A"}/day</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-foreground">
              <DollarSign className="h-4.5 w-4.5 text-primary" />
              <span>{listingData.stipend || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-foreground col-span-2 border-t border-muted pt-2 mt-1">
              <Calendar className="h-4.5 w-4.5 text-primary" />
              <span>
                Deadline:{" "}
                <span className="font-medium text-muted-foreground">
                  {new Date(listingData.deadline).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-muted">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Application Status</span>
              <StatusBadge status={appData.status} />
            </div>
            <div className="flex items-center justify-between mt-2.5">
              <span className="text-xs text-muted-foreground">Applied on</span>
              <span className="text-xs font-semibold text-foreground">
                {new Date(appData.appliedDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {canWithdraw && (
            <div className="pt-6 border-t border-muted mt-2">
              <Button
                variant="destructive"
                className="w-full gap-2 hover:bg-destructive/90 transition-all font-medium py-5 shadow-sm"
                onClick={handleWithdraw}
                disabled={isWithdrawing}
              >
                {isWithdrawing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Withdrawing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Withdraw Application
                  </>
                )}
              </Button>
              <p className="text-[11px] text-muted-foreground text-center mt-2.5 leading-normal">
                Withdrawal is permanent and can only be performed while the application status is still in "Submitted" state.
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-muted-foreground py-6">Could not load application details.</p>
      )}
    </div>
  )

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-[440px] sm:max-w-[440px] overflow-y-auto">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="text-xl font-bold tracking-tight">Application Details</SheetTitle>
            <SheetDescription className="sr-only">View details about your submitted application.</SheetDescription>
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
          <DrawerTitle className="text-xl font-bold tracking-tight">Application Details</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto pb-8">{content}</div>
      </DrawerContent>
    </Drawer>
  )
}
