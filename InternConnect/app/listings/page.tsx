"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EmptyState } from "@/components/EmptyState"
import { 
  Search, 
  MapPin, 
  CalendarIcon, 
  Clock, 
  DollarSign, 
  SlidersHorizontal,
  X
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { 
  listings, 
  getEmployerById, 
  jobFields, 
  locations, 
  workHoursOptions 
} from "@/lib/mock-data"

export default function ListingsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedJobField, setSelectedJobField] = useState("all")
  const [selectedWorkHours, setSelectedWorkHours] = useState("all")
  const [deadline, setDeadline] = useState<Date | undefined>(undefined)
  const [minStipend, setMinStipend] = useState("")
  const [maxStipend, setMaxStipend] = useState("")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      // Search filter
      const matchesSearch = 
        searchQuery === "" ||
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Location filter
      const matchesLocation = 
        selectedLocation === "all" || 
        listing.location === selectedLocation
      
      // Job field filter
      const matchesJobField = 
        selectedJobField === "all" || 
        listing.jobField === selectedJobField
      
      // Work hours filter
      const matchesWorkHours = 
        selectedWorkHours === "all" || 
        listing.workHours === selectedWorkHours
      
      // Deadline filter
      const matchesDeadline = 
        !deadline || 
        new Date(listing.deadline) >= deadline
      
      // Status filter (only show active listings)
      const isActive = listing.status === "active"
      
      return matchesSearch && matchesLocation && matchesJobField && matchesWorkHours && matchesDeadline && isActive
    })
  }, [searchQuery, selectedLocation, selectedJobField, selectedWorkHours, deadline])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedLocation("all")
    setSelectedJobField("all")
    setSelectedWorkHours("all")
    setDeadline(undefined)
    setMinStipend("")
    setMaxStipend("")
  }

  const hasActiveFilters = 
    searchQuery !== "" || 
    selectedLocation !== "all" || 
    selectedJobField !== "all" || 
    selectedWorkHours !== "all" || 
    deadline !== undefined

  const FilterContent = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Job Field</label>
        <Select value={selectedJobField} onValueChange={setSelectedJobField}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All fields" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fields</SelectItem>
            {jobFields.map((field) => (
              <SelectItem key={field} value={field}>
                {field}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Location</label>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Work Hours</label>
        <Select value={selectedWorkHours} onValueChange={setSelectedWorkHours}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any hours" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Hours</SelectItem>
            {workHoursOptions.map((hours) => (
              <SelectItem key={hours} value={hours}>
                {hours}/day
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Deadline After</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !deadline && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {deadline ? format(deadline, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={deadline}
              onSelect={setDeadline}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Stipend Range</label>
        <div className="flex gap-2">
          <Input
            placeholder="Min"
            value={minStipend}
            onChange={(e) => setMinStipend(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Max"
            value={maxStipend}
            onChange={(e) => setMaxStipend(e.target.value)}
            className="flex-1"
          />
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" className="w-full" onClick={clearFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Browse Listings</h1>
        <p className="text-muted-foreground mt-2">
          Find internships and job opportunities that match your interests
        </p>
      </div>

      <div className="flex gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <Card className="sticky top-24">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FilterContent />
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Mobile Filter Button */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      !
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6 overflow-y-auto">
                  <FilterContent />
                </div>
                <div className="pt-4 border-t mt-4">
                  <Button 
                    className="w-full" 
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    Apply Filters ({filteredListings.length} results)
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredListings.length} {filteredListings.length === 1 ? "listing" : "listings"}
          </p>

          {/* Listings Grid */}
          {filteredListings.length === 0 ? (
            <EmptyState type="listings" />
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredListings.map((listing) => {
                const employer = getEmployerById(listing.employerId)
                return (
                  <Link key={listing.id} href={`/listings/${listing.id}`}>
                    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 flex-shrink-0">
                            <AvatarImage src={employer?.logo} alt={employer?.companyName} />
                            <AvatarFallback>
                              {employer?.companyName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base line-clamp-1">{listing.title}</CardTitle>
                            <p className="text-sm text-muted-foreground">{employer?.companyName}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{listing.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4 flex-shrink-0" />
                            <span>{listing.workHours}/day</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <DollarSign className="h-4 w-4 flex-shrink-0" />
                            <span>{listing.stipend}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                            <span>Deadline: {new Date(listing.deadline).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
