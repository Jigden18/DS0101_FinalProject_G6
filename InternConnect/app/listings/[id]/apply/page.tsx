"use client"

import { useState, use, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Upload, FileText, Loader2 } from "lucide-react"
import { getListing, submitApplication } from "@/lib/api-client"
import { useAuth } from "@/context/AuthContext"
import { safeToastError, safeToastSuccess } from "@/lib/toast-helper"

interface PageProps {
  params: Promise<{ id: string }>
}

interface Listing {
  id: string
  title: string
  employer?: {
    id: string
    companyName: string
    logo?: string
  }
}

export default function ApplyPage({ params }: PageProps) {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { id } = use(params)

  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoadingListing, setIsLoadingListing] = useState(true)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [coverLetter, setCoverLetter] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ resume?: string; coverLetter?: string }>({})

  useEffect(() => {
    const fetchListing = async () => {
      setIsLoadingListing(true)
      try {
        const { data } = await getListing(id)
        if (data) setListing(data)
      } catch (err) {
        safeToastError("Failed to load listing")
      } finally {
        setIsLoadingListing(false)
      }
    }
    fetchListing()
  }, [id])

  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!coverLetter.trim()) {
      newErrors.coverLetter = "Cover letter is required"
    } else if (coverLetter.trim().length < 50) {
      newErrors.coverLetter = "Cover letter must be at least 50 characters"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !user || !resumeFile) return

    setIsSubmitting(true)
    try {
      const { error } = await submitApplication(id, coverLetter, resumeFile)

      if (error) {
        safeToastError(error)
        return
      }

      safeToastSuccess("Application submitted successfully!")
      router.push("/dashboard/student")
    } catch (err) {
      safeToastError("Failed to submit application")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || isLoadingListing) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!listing) {
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

  const employer = listing.employer

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
              <AvatarImage src={employer?.logo} alt={employer?.companyName} />
              <AvatarFallback>
                {employer?.companyName?.slice(0, 2).toUpperCase() || "CO"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{listing.title}</h2>
              <p className="text-sm text-muted-foreground">
                {employer?.companyName || "Company"}
              </p>
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

            {/* Cover Letter */}
            <div className="space-y-2">
              <Label htmlFor="coverLetter">
                Cover Letter <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="coverLetter"
                placeholder="Tell the employer why you're a great fit for this role. Mention your relevant skills, experience, and what excites you about this opportunity..."
                value={coverLetter}
                onChange={(e) => {
                  setCoverLetter(e.target.value)
                  if (errors.coverLetter) {
                    setErrors((prev) => ({ ...prev, coverLetter: undefined }))
                  }
                }}
                rows={7}
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center">
                {errors.coverLetter ? (
                  <p className="text-sm text-destructive">{errors.coverLetter}</p>
                ) : (
                  <span />
                )}
                <p className={`text-xs ml-auto ${
                  coverLetter.length < 50
                    ? "text-muted-foreground"
                    : "text-green-600"
                }`}>
                  {coverLetter.length} / 50 min characters
                </p>
              </div>
            </div>

            {/* Resume Upload */}
            <div className="space-y-2">
              <Label htmlFor="resume">
                Resume / CV (PDF only) <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    resumeFile
                      ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                      : "border-muted-foreground/25 hover:border-primary"
                  }`}
                >
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
                        disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>
              {errors.resume && (
                <p className="text-sm text-destructive">{errors.resume}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting || !user}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
              <Link href={`/listings/${id}`} className="flex-1 sm:flex-initial">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isSubmitting}
                >
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