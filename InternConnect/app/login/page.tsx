"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {}
    
    if (!email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email"
    }
    
    if (!password) {
      newErrors.password = "Password is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    // Simulate network delay
    setTimeout(() => {
      const result = login(email, password)
      
      if (!result.success) {
        setErrors({ form: result.error })
        toast.error(result.error || "Login failed")
        setIsLoading(false)
        return
      }

      toast.success("Login successful!")
      
      // Get role from the result to determine redirect
      // Since login was successful, the role is set in context
      // We need to check what role was set
      if (email.includes("admin")) {
        router.push("/dashboard/admin")
      } else if (email.includes("@techcorp") || email.includes("@greenleaf") || email.includes("@financeplus")) {
        router.push("/dashboard/employer")
      } else {
        router.push("/dashboard/student")
      }
      
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your InternConnect account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errors.form && (
              <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                {errors.form}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>
            
            {/* Demo credentials hint */}
            <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              <p className="font-medium mb-1">Demo Credentials:</p>
              <p>Student: alex.chen@university.edu / student123</p>
              <p>Employer: hr@techcorp.com / employer123</p>
              <p>Admin: admin@internconnect.com / admin123</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              {"Don't have an account? "}
              <Link href="/register/student" className="text-primary hover:underline">
                Register as Student
              </Link>
              {" or "}
              <Link href="/register/employer" className="text-primary hover:underline">
                Employer
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
