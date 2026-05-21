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
import { useAuth } from "@/context/AuthContext"
import { getUser, updateUser, uploadAvatar, deleteUser, changePassword } from "@/lib/api-client"
import { safeToastError, safeToastSuccess } from "@/lib/toast-helper"

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
  const { user, logout } = useAuth()
  
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    industry: "",
    location: "",
    bio: "",
  })
  const [logoPreview, setLogoPreview] = useState<string | undefined>()
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return
      try {
        const { data: userData, error } = await getUser(user.id)
        if (error || !userData) {
          safeToastError(error || "Failed to load profile")
          return
        }
        const employerData = userData.employer || {}
        setFormData({
          companyName: employerData.companyName || "",
          contactPerson: employerData.contactPerson || "",
          email: userData.email || "",
          industry: employerData.industry || "",
          location: employerData.location || "",
          bio: employerData.companyBio || "",
        })
        setLogoPreview(employerData.logoUrl)
      } catch (err) {
        console.error("Failed to load profile:", err)
        safeToastError("Failed to load profile")
      }
    }
    loadProfile()
  }, [user?.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    if (!user?.id) return
    setIsLoading(true)
    try {
      if (logoFile) {
        const { error: logoErr } = await uploadAvatar(user.id, logoFile)
        if (logoErr) {
          safeToastError(logoErr)
          setIsLoading(false)
          return
        }
      }

      const { error: updateErr } = await updateUser(user.id, {
        company_name: formData.companyName,
        contact_person: formData.contactPerson,
        industry: formData.industry,
        location: formData.location,
        company_bio: formData.bio,
      })

      if (updateErr) {
        safeToastError(updateErr)
      } else {
        safeToastSuccess("Profile saved successfully!")
      }
    } catch (err) {
      safeToastError("Failed to save profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user?.id) return
    try {
      const { error } = await deleteUser(user.id)
      if (error) {
        safeToastError(error)
      } else {
        safeToastSuccess("Account deleted successfully!")
        logout()
        router.push("/")
      }
    } catch (err) {
      safeToastError("Failed to delete account")
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return

    if (newPassword !== confirmNewPassword) {
      safeToastError("New passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      safeToastError("Password must be at least 6 characters long")
      return
    }

    setIsChangingPassword(true)
    try {
      const { error } = await changePassword(user.id, currentPassword, newPassword)
      if (error) {
        safeToastError(error)
      } else {
        safeToastSuccess("Password changed successfully!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmNewPassword("")
      }
    } catch (err) {
      safeToastError("Failed to change password")
    } finally {
      setIsChangingPassword(false)
    }
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
                onImageChange={(file, preview) => {
                  setLogoPreview(preview)
                  if (file) setLogoFile(file)
                }}
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

              <div className="flex flex-col sm:flex-row gap-4 pt-8">
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

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Security & Password</CardTitle>
          <CardDescription>
            Ensure your account is using a secure password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={isChangingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isChangingPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                disabled={isChangingPassword}
              />
            </div>
            <div className="pt-6">
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? "Changing Password..." : "Change Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
