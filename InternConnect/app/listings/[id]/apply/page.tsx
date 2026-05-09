"use client"

import { useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Upload, FileText } from "lucide-react"
import { toast } from "sonner"
import { getListingById, getEmployerById } from "@/lib/mock-data"

interface PageProps {
  params: Promise<{ id: string }>
}

export default function ApplyPage({ params }: PageProps) {
  const router = useRouter()
  const { id } = use(params)
  const listing = getListingById(id)
  const employer = listing ? getEmployerById(listing.employerId) : null

  const [coverLetter, setCoverLetter] = useState("")
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ coverLetter?: string; resume?: string }>({})

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!coverLetter.trim()) {
      newErrors.coverLetter = "Cover letter is required"
    } else if (coverLetter.length < 50) {
      newErrors.coverLetter = "Cover letter should be at least 50 characters"
    }

    if (!resumeFile) {
      newErrors.resume = "Resume is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== "application/pdf") {
        setErrors((prev) => ({ ...prev, resume: "Only PDF files are accepted" }))
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, resume: "File size must be less than 5MB" }))
        return
      }
      setResumeFile(file)
      setErrors((prev) => ({ ...prev, resume: undefined }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    
    // Simulate submission
    setTimeout(() => {
      toast.success("Application submitted successfully!")
      router.push("/dashboard/student")
      setIsLoading(false)
    }, 1000)
  }

  if (!listing || !employer) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Listing not found</p>
            <div className="flex justify-center mt-4">
              <Link href="/listings">
                <Button>Browse Listings</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={`/listings/${id}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Listing
      </Link>

      {/* Listing Summary */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={employer.logo} alt={employer.companyName} />
              <AvatarFallback>{employer.companyName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{listing.title}</h2>
              <p className="text-sm text-muted-foreground">{employer.companyName}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Submit Application</CardTitle>
          <CardDescription>
            Complete the form below to apply for this position
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter</Label>
              <Textarea
                id="coverLetter"
                placeholder="Tell us why you're a great fit for this position..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={8}
                disabled={isLoading}
              />
              {errors.coverLetter && (
                <p className="text-sm text-destructive">{errors.coverLetter}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {coverLetter.length} characters (minimum 50)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume">Resume / CV (PDF only)</Label>
              <div className="relative">
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  resumeFile ? "border-green-500 bg-green-50" : "hover:border-primary"
                }`}>
                  {resumeFile ? (
                    <div className="space-y-2">
                      <FileText className="h-8 w-8 mx-auto text-green-600" />
                      <p className="text-sm font-medium">{resumeFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(resumeFile.size / 1024).toFixed(1)} KB
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setResumeFile(null)}
                        disabled={isLoading}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">PDF up to 5MB</p>
                    </div>
                  )}
                </div>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={isLoading}
                />
              </div>
              {errors.resume && (
                <p className="text-sm text-destructive">{errors.resume}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Application"}
              </Button>
              <Link href={`/listings/${id}`} className="flex-1 sm:flex-initial">
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
