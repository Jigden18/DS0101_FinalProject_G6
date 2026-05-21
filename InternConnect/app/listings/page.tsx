"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { EmptyState } from "@/components/EmptyState"
import { 
  Search, 
  MapPin, 
  CalendarIcon, 
  Clock, 
  DollarSign, 
  SlidersHorizontal,
  X,
  Loader2
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { getListings, getConstants, searchListings, getSuggestions } from "@/lib/api-client"

interface Listing {
  id: string
  title: string
  description: string
  location: string
  workHours: string
  stipend: string
  deadline: string
  jobField: string
  employerId: string
  employer?: {
    id: string
    companyName: string
    logo?: string
  }
  status: string
}

export default function ListingsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedJobField, setSelectedJobField] = useState("all")
  const [selectedWorkHours, setSelectedWorkHours] = useState("all")
  const [deadline, setDeadline] = useState<Date | undefined>(undefined)
  const [minStipend, setMinStipend] = useState("")
  const [maxStipend, setMaxStipend] = useState("")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [jobFields, setJobFields] = useState<string[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [workHoursOptions, setWorkHoursOptions] = useState<string[]>([])

  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Fetch dropdown constants
  useEffect(() => {
    const fetchConstants = async () => {
      try {
        const { data: constantsData } = await getConstants()
        if (constantsData) {
          setJobFields(constantsData.job_fields || [])
          setLocations(constantsData.locations || [])
          setWorkHoursOptions(constantsData.work_hours || [])
        }
      } catch (err) {
        console.error("Failed to fetch constants", err)
      }
    }
    fetchConstants()
  }, [])

  // Execute server-side search
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      const filtersObj: Record<string, any> = {}
      if (selectedLocation !== "all") {
        filtersObj.location = [selectedLocation]
      }
      if (selectedJobField !== "all") {
        filtersObj.jobField = [selectedJobField]
      }
      if (selectedWorkHours !== "all") {
        filtersObj.workHours = [selectedWorkHours]
      }
      if (deadline) {
        filtersObj.deadline_after = deadline.toISOString()
      }

      const { data, error: searchError } = await searchListings({
        q: searchQuery,
        filters: filtersObj,
      })

      if (searchError) {
        setError(searchError)
      } else if (data) {
        const results = data.results || []
        const mappedListings = results.map((l: any) => ({
          ...l,
          employer: l.employer ? {
            ...l.employer,
            logo: l.employer.logoUrl || l.employer.logo
          } : undefined
        }))
        setListings(mappedListings)
      }
    } catch (err) {
      setError("Failed to execute search")
    } finally {
      setIsLoading(false)
    }
  }

  const executeSearchWithQuery = async (query: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const filtersObj: Record<string, any> = {}
      if (selectedLocation !== "all") {
        filtersObj.location = [selectedLocation]
      }
      if (selectedJobField !== "all") {
        filtersObj.jobField = [selectedJobField]
      }
      if (selectedWorkHours !== "all") {
        filtersObj.workHours = [selectedWorkHours]
      }
      if (deadline) {
        filtersObj.deadline_after = deadline.toISOString()
      }

      const { data, error: searchError } = await searchListings({
        q: query,
        filters: filtersObj,
      })

      if (searchError) {
        setError(searchError)
      } else if (data) {
        const results = data.results || []
        const mappedListings = results.map((l: any) => ({
          ...l,
          employer: l.employer ? {
            ...l.employer,
            logo: l.employer.logoUrl || l.employer.logo
          } : undefined
        }))
        setListings(mappedListings)
      }
    } catch (err) {
      setError("Failed to execute search")
    } finally {
      setIsLoading(false)
    }
  }

  // Trigger search on filter changes
  useEffect(() => {
    handleSearch()
  }, [selectedLocation, selectedJobField, selectedWorkHours, deadline])

  // Get Autocomplete suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([])
      return
    }
    const fetchSuggestions = async () => {
      try {
        const { data } = await getSuggestions(searchQuery)
        if (data && Array.isArray(data.suggestions)) {
          setSuggestions(data.suggestions)
        }
      } catch (err) {
        console.error("Failed to get suggestions:", err)
      }
    }
    const timer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Browse Listings</h1>
        <p className="text-muted-foreground mt-2">
          Find internships and job opportunities that match your interests
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

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
          <form onSubmit={handleSearch} className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or description..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-9"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-popover text-popover-foreground border rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => {
                        setSearchQuery(suggestion)
                        setShowSuggestions(false)
                        setTimeout(() => {
                          executeSearchWithQuery(suggestion)
                        }, 50)
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground text-sm truncate"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit">Search</Button>
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button type="button" variant="outline" className="gap-2">
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
                  <SheetDescription className="sr-only">
                    Filter job and internship listings by field, location, hours, deadline, and stipend.
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 overflow-y-auto">
                  <FilterContent />
                </div>
                <div className="pt-4 border-t mt-4">
                  <Button 
                    type="button"
                    className="w-full" 
                    onClick={() => {
                      setMobileFiltersOpen(false)
                      handleSearch()
                    }}
                  >
                    Apply Filters ({listings.length} results)
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </form>

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-4">
            Showing {listings.length} {listings.length === 1 ? "listing" : "listings"}
          </p>

          {/* Listings Grid */}
          {listings.length === 0 ? (
            <EmptyState type="listings" />
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <Link key={listing.id} href={`/listings/${listing.id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarImage src={listing.employer?.logo} alt={listing.employer?.companyName} />
                          <AvatarFallback>
                            {listing.employer?.companyName?.slice(0, 2).toUpperCase() || "CO"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base line-clamp-1">{listing.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{listing.employer?.companyName || "Company"}</p>
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
                          <span>{listing.workHours}</span>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
