"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ProfileAvatar } from "@/components/ProfileAvatar"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { employers } from "@/lib/mock-data"

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

export default function EmployerProfilePage() {
  const router = useRouter()
  const { currentEmployer, logout } = useAuth()
  
  // Use current employer or fall back to first employer (for role switcher)
  const employer = currentEmployer || employers[0]
  
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    industry: "",
    location: "",
    bio: "",
  })
  const [logoPreview, setLogoPreview] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (employer) {
      setFormData({
        companyName: employer.companyName,
        contactPerson: employer.contactPerson,
        email: employer.email,
        industry: employer.industry,
        location: employer.location,
        bio: employer.bio,
      })
      setLogoPreview(employer.logo)
    }
  }, [employer])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    setIsLoading(true)
    setTimeout(() => {
      toast.success("Profile saved successfully!")
      setIsLoading(false)
    }, 1000)
  }

  const handleDeleteAccount = () => {
    toast.success("Account deleted successfully!")
    logout()
    router.push("/")
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Employer Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your company profile information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Update your company details and profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Logo Section */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <ProfileAvatar
                src={logoPreview}
                alt={formData.companyName}
                fallback={formData.companyName.slice(0, 2).toUpperCase() || "CO"}
                size="lg"
                editable
                onImageChange={(_, preview) => setLogoPreview(preview)}
              />
              <p className="text-xs text-muted-foreground">Click to change logo</p>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person Name</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={formData.industry}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Company Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell students about your company..."
                  disabled={isLoading}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button onClick={handleSave} disabled={isLoading} className="flex-1 sm:flex-initial">
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-1 sm:flex-initial">
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your company account 
                        and remove all your listings and data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount}>
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
