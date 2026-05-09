"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProfileAvatar } from "@/components/ProfileAvatar"
import { toast } from "sonner"

const industries = [
  "Technology",
  "Finance",
  "Marketing",
  "Healthcare",
  "Education",
  "Media",
  "Manufacturing",
  "Retail",
  "Consulting",
  "Other",
]

export default function EmployerRegistrationPage() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    password: "",
    confirmPassword: "",
    industry: "",
    location: "",
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | undefined>()
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Company name is required"
    }
    
    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = "Contact person name is required"
    }
    
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }
    
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    
    if (!formData.industry) {
      newErrors.industry = "Industry is required"
    }
    
    if (!formData.location.trim()) {
      newErrors.location = "Company location is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    
    // Simulate registration (pending approval)
    setTimeout(() => {
      toast.success("Registration submitted! Your account is pending admin approval.")
      router.push("/login")
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Employer Registration</CardTitle>
          <CardDescription>
            Register your company to start posting internship opportunities
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Company Logo */}
            <div className="flex flex-col items-center gap-2">
              <ProfileAvatar
                src={logoPreview}
                alt="Company Logo"
                fallback="CO"
                size="lg"
                editable
                onImageChange={(file, preview) => {
                  setLogoFile(file)
                  setLogoPreview(preview)
                }}
              />
              <p className="text-xs text-muted-foreground">Click to upload company logo</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="TechCorp Solutions"
                  value={formData.companyName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.companyName && (
                  <p className="text-sm text-destructive">{errors.companyName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person Name</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  placeholder="John Smith"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.contactPerson && (
                  <p className="text-sm text-destructive">{errors.contactPerson}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Company Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="hr@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, industry: value }))
                      if (errors.industry) {
                        setErrors((prev) => ({ ...prev, industry: "" }))
                      }
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.industry && (
                    <p className="text-sm text-destructive">{errors.industry}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Company Location</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="San Francisco, CA"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  {errors.location && (
                    <p className="text-sm text-destructive">{errors.location}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              <p>Note: Employer accounts require admin approval before you can post listings.</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit Registration"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Looking for internships?{" "}
              <Link href="/register/student" className="text-primary hover:underline">
                Register as Student
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
