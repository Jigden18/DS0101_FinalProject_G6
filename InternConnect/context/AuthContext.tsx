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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
  currentStudent: any | null
  currentEmployer: any | null
  currentAdmin: any | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [role, setRoleState] = useState<UserRole | null>(null)
  const [currentStudent, setCurrentStudent] = useState<any | null>(null)
  const [currentEmployer, setCurrentEmployer] = useState<any | null>(null)
  const [currentAdmin, setCurrentAdmin] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize from token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (token) {
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
          const { data, error } = await getUser("me")
          if (data && !error) {
            const userData = data
            setUser({
              id: userData.id,
              name: userData.name || userData.contactPerson || "User",
              email: userData.email,
              role: userData.role || "student",
              avatar: userData.avatar,
              companyName: userData.companyName,
              logo: userData.logo,
            })
            setRoleState(userData.role || "student")
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
    setCurrentStudent(null)
    setCurrentEmployer(null)
    setCurrentAdmin(null)
    setUser(null)
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    try {
      const { data, error } = await apiLogin(email, password)

      if (error) {
        return { success: false, error }
      }

      if (data) {
        const role = data.role || data.user?.role || "student"
        setRoleState(role as UserRole)
        setUser({
          id: data.id || data.user?.id,
          name: data.name || data.user?.name || data.contactPerson || email,
          email: data.email || email,
          role: role as UserRole,
          avatar: data.avatar || data.user?.avatar,
          companyName: data.companyName || data.user?.companyName,
          logo: data.logo || data.user?.logo,
        })
        return { success: true }
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
      setCurrentStudent(null)
      setCurrentEmployer(null)
      setCurrentAdmin(null)
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
        currentStudent,
        currentEmployer,
        currentAdmin,
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

