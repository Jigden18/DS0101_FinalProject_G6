"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth, UserRole } from "@/context/AuthContext"

export function RoleSwitcher() {
  const { role, setRole } = useAuth()

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground hidden sm:inline">Dev:</span>
      <Select
        value={role || "none"}
        onValueChange={(value) => setRole(value === "none" ? null : (value as UserRole))}
      >
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">Not logged in</SelectItem>
          <SelectItem value="student">Student</SelectItem>
          <SelectItem value="employer">Employer</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
