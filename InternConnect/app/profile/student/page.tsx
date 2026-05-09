"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { students } from "@/lib/mock-data"

export default function StudentProfilePage() {
  const router = useRouter()
  const { currentStudent, logout } = useAuth()
  
  // Use current student or fall back to first student (for role switcher)
  const student = currentStudent || students[0]
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    university: "",
    course: "",
    graduationYear: "",
  })
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>()
  const [isLoading, setIsLoading] = useState(false)

  const currentYear = new Date().getFullYear()
  const graduationYears = Array.from({ length: 8 }, (_, i) => currentYear - 2 + i)

  useEffect(() => {
    if (student) {
      setFormData({
        fullName: student.name,
        email: student.email,
        university: student.university,
        course: student.course,
        graduationYear: student.graduationYear.toString(),
      })
      setAvatarPreview(student.avatar)
    }
  }, [student])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        <h1 className="text-3xl font-bold text-foreground">Student Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <ProfileAvatar
                src={avatarPreview}
                alt={formData.fullName}
                fallback={formData.fullName.split(" ").map(n => n[0]).join("").toUpperCase() || "?"}
                size="lg"
                editable
                onImageChange={(_, preview) => setAvatarPreview(preview)}
              />
              <p className="text-xs text-muted-foreground">Click to change photo</p>
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
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

              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Input
                  id="university"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="course">Course / Program</Label>
                  <Input
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Graduation Year</Label>
                  <Select
                    value={formData.graduationYear}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, graduationYear: value }))}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="graduationYear">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {graduationYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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
                        This action cannot be undone. This will permanently delete your account 
                        and remove all your data including your applications.
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
