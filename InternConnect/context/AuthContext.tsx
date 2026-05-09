"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { 
  Student, 
  Employer, 
  Admin, 
  students, 
  employers, 
  admins,
  findUserByCredentials,
  type UserRole
} from "@/lib/mock-data"

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
  login: (email: string, password: string) => { success: boolean; error?: string }
  logout: () => void
  isAuthenticated: boolean
  currentStudent: Student | null
  currentEmployer: Employer | null
  currentAdmin: Admin | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [role, setRoleState] = useState<UserRole | null>(null)
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null)
  const [currentEmployer, setCurrentEmployer] = useState<Employer | null>(null)
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null)

  const setRole = (newRole: UserRole | null) => {
    setRoleState(newRole)
    setCurrentStudent(null)
    setCurrentEmployer(null)
    setCurrentAdmin(null)

    if (newRole === "student") {
      const student = students[0]
      setCurrentStudent(student)
      setUser({
        id: student.id,
        name: student.name,
        email: student.email,
        role: "student",
        avatar: student.avatar,
      })
    } else if (newRole === "employer") {
      const employer = employers[0]
      setCurrentEmployer(employer)
      setUser({
        id: employer.id,
        name: employer.contactPerson,
        email: employer.email,
        role: "employer",
        companyName: employer.companyName,
        logo: employer.logo,
      })
    } else if (newRole === "admin") {
      const admin = admins[0]
      setCurrentAdmin(admin)
      setUser({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: "admin",
      })
    } else {
      setUser(null)
    }
  }

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    const result = findUserByCredentials(email, password)
    
    if (!result) {
      return { success: false, error: "Invalid email or password" }
    }

    const { user: foundUser, role: foundRole } = result
    setRoleState(foundRole)

    if (foundRole === "student") {
      const student = foundUser as Student
      setCurrentStudent(student)
      setCurrentEmployer(null)
      setCurrentAdmin(null)
      setUser({
        id: student.id,
        name: student.name,
        email: student.email,
        role: "student",
        avatar: student.avatar,
      })
    } else if (foundRole === "employer") {
      const employer = foundUser as Employer
      setCurrentStudent(null)
      setCurrentEmployer(employer)
      setCurrentAdmin(null)
      setUser({
        id: employer.id,
        name: employer.contactPerson,
        email: employer.email,
        role: "employer",
        companyName: employer.companyName,
        logo: employer.logo,
      })
    } else if (foundRole === "admin") {
      const admin = foundUser as Admin
      setCurrentStudent(null)
      setCurrentEmployer(null)
      setCurrentAdmin(admin)
      setUser({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: "admin",
      })
    }

    return { success: true }
  }

  const logout = () => {
    setUser(null)
    setRoleState(null)
    setCurrentStudent(null)
    setCurrentEmployer(null)
    setCurrentAdmin(null)
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
