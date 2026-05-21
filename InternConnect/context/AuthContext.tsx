"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { login as apiLogin, logout as apiLogout, getUser, refreshToken as apiRefreshToken, setToken, removeToken } from "@/lib/api-client"
import type { UserRole } from "@/lib/mock-data"

export type { UserRole }

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  companyName?: string
  logo?: string
}

interface AuthContextType {
  user: AuthUser | null
  role: UserRole | null
  setRole: (role: UserRole | null) => void
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: UserRole | null }>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function normalizeRole(role: unknown): UserRole | null {
  if (typeof role !== "string") return null
  const normalized = role.toLowerCase()
  if (normalized === "student" || normalized === "employer" || normalized === "admin") {
    return normalized
  }
  return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [role, setRoleState] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize from token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
      if (token && userId) {
        setIsLoading(true)
        try {
          // Attempt to refresh the JWT to verify the session
          const refreshRes = await apiRefreshToken()
          if (refreshRes.error) {
            removeToken()
            setIsLoading(false)
            return
          }
          
          // Try to fetch current user data
          const { data, error } = await getUser(userId)
          if (data && !error) {
            const userData = data
            const normalizedRole = normalizeRole(userData.role) || "student"
            const profile = userData.student || userData.employer || userData.admin || {}
            setUser({
              id: userData.id,
              name: profile.fullName || profile.companyName || userData.name || "User",
              email: userData.email,
              role: normalizedRole,
              avatar: userData.student?.avatarUrl,
              companyName: userData.employer?.companyName,
              logo: userData.employer?.logoUrl,
            })
            setRoleState(normalizedRole)
          }
        } catch (err) {
          // Token may be invalid, clear it
          removeToken()
        } finally {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()
  }, [])

  const setRole = (newRole: UserRole | null) => {
    setRoleState(newRole)
    setUser(null)
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; role?: UserRole | null }> => {
    setIsLoading(true)
    try {
      const { data, error } = await apiLogin(email, password)

      if (error) {
        return { success: false, error }
      }

      if (data) {
        const role = normalizeRole(data.role || data.user?.role) || "student"
        setRoleState(role)
        setUser({
          id: data.id || data.user?.id,
          name: data.name || data.user?.name || data.contactPerson || email,
          email: data.email || email,
          role,
          avatar: data.avatar || data.user?.avatar,
          companyName: data.companyName || data.user?.companyName,
          logo: data.logo || data.user?.logo,
        })
        return { success: true, role }
      }

      return { success: false, error: "Login failed" }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await apiLogout()
    } finally {
      setUser(null)
      setRoleState(null)
      removeToken()
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        setRole,
        login,
        logout,
        isAuthenticated: user !== null,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

