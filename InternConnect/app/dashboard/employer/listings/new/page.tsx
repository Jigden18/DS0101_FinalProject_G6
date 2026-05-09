"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ArrowLeft, CalendarIcon, Plus, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { locations, workHoursOptions, jobFields, defaultRequirements } from "@/lib/mock-data"

export default function NewListingPage() {
  const router = useRouter()
  
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [jobField, setJobField] = useState("")
  const [workHours, setWorkHours] = useState("")
  const [stipend, setStipend] = useState("")
  const [deadline, setDeadline] = useState<Date | undefined>(undefined)
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>([])
  const [customRequirement, setCustomRequirement] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleRequirementToggle = (requirement: string) => {
    setSelectedRequirements(prev => 
      prev.includes(requirement)
        ? prev.filter(r => r !== requirement)
        : [...prev, requirement]
    )
  }

  const handleAddCustomRequirement = () => {
    if (customRequirement.trim() && !selectedRequirements.includes(customRequirement.trim())) {
      setSelectedRequirements(prev => [...prev, customRequirement.trim()])
      setCustomRequirement("")
    }
  }

  const handleRemoveRequirement = (requirement: string) => {
    setSelectedRequirements(prev => prev.filter(r => r !== requirement))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) newErrors.title = "Title is required"
    if (!description.trim()) newErrors.description = "Description is required"
    else if (description.length < 50) newErrors.description = "Description should be at least 50 characters"
    if (!location) newErrors.location = "Location is required"
    if (!jobField) newErrors.jobField = "Job field is required"
    if (!workHours) newErrors.workHours = "Work hours is required"
    if (!stipend.trim()) newErrors.stipend = "Stipend is required"
    if (!deadline) newErrors.deadline = "Deadline is required"
    else if (deadline < new Date()) newErrors.deadline = "Deadline must be in the future"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setTimeout(() => {
      toast.success("Listing saved successfully!")
      router.push("/dashboard/employer")
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/dashboard/employer"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Listings
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Listing</CardTitle>
          <CardDescription>
            Fill in the details to post a new job or internship opportunity
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                placeholder="e.g., Software Engineering Intern"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the role, responsibilities, and what the candidate will be working on..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                disabled={isLoading}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              <p className="text-xs text-muted-foreground">{description.length} characters (minimum 50)</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="jobField">Job Field</Label>
                <Select value={jobField} onValueChange={setJobField} disabled={isLoading}>
                  <SelectTrigger id="jobField">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobFields.map((field) => (
                      <SelectItem key={field} value={field}>{field}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.jobField && <p className="text-sm text-destructive">{errors.jobField}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select value={location} onValueChange={setLocation} disabled={isLoading}>
                  <SelectTrigger id="location">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workHours">Work Hours per Day</Label>
                <Select value={workHours} onValueChange={setWorkHours} disabled={isLoading}>
                  <SelectTrigger id="workHours">
                    <SelectValue placeholder="Select hours" />
                  </SelectTrigger>
                  <SelectContent>
                    {workHoursOptions.map((hours) => (
                      <SelectItem key={hours} value={hours}>{hours}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.workHours && <p className="text-sm text-destructive">{errors.workHours}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stipend">Stipend / Salary</Label>
                <Input
                  id="stipend"
                  placeholder="e.g., $2,500/month"
                  value={stipend}
                  onChange={(e) => setStipend(e.target.value)}
                  disabled={isLoading}
                />
                {errors.stipend && <p className="text-sm text-destructive">{errors.stipend}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Application Deadline</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deadline && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "PPP") : "Select deadline"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deadline}
                    onSelect={setDeadline}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.deadline && <p className="text-sm text-destructive">{errors.deadline}</p>}
            </div>

            <div className="space-y-3">
              <Label>Requirements</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {defaultRequirements.map((req) => (
                  <div key={req} className="flex items-center space-x-2">
                    <Checkbox
                      id={req}
                      checked={selectedRequirements.includes(req)}
                      onCheckedChange={() => handleRequirementToggle(req)}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor={req}
                      className="text-sm leading-none cursor-pointer"
                    >
                      {req}
                    </label>
                  </div>
                ))}
              </div>
              
              {/* Custom requirements */}
              {selectedRequirements.filter(r => !defaultRequirements.includes(r)).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedRequirements
                    .filter(r => !defaultRequirements.includes(r))
                    .map((req) => (
                      <div key={req} className="flex items-center gap-1 bg-muted px-2 py-1 rounded text-sm">
                        {req}
                        <button
                          type="button"
                          onClick={() => handleRemoveRequirement(req)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="Add custom requirement..."
                  value={customRequirement}
                  onChange={(e) => setCustomRequirement(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddCustomRequirement()
                    }
                  }}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCustomRequirement}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Saving..." : "Create Listing"}
              </Button>
              <Link href="/dashboard/employer" className="flex-1 sm:flex-initial">
                <Button type="button" variant="outline" className="w-full" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
