import { Badge } from "@/components/ui/badge"

export type ApplicationStatus = "submitted" | "under_review" | "accepted" | "rejected"
export type ListingStatus = "active" | "closed" | "pending"
export type UserStatus = "active" | "inactive" | "pending"

export type StatusType = ApplicationStatus | ListingStatus | UserStatus

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  submitted: {
    label: "Submitted",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  under_review: {
    label: "Under Review",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  accepted: {
    label: "Accepted",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-100 text-red-800 hover:bg-red-100",
  },
  active: {
    label: "Active",
    className: "bg-green-100 text-green-800 hover:bg-green-100",
  },
  closed: {
    label: "Closed",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
  pending: {
    label: "Pending",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  },
  inactive: {
    label: "Inactive",
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  },
}

interface StatusBadgeProps {
  status: StatusType
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = (status || "").toLowerCase() as StatusType
  const config = statusConfig[normalizedStatus] || {
    label: typeof status === 'string' ? status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : String(status),
    className: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  }
  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  )
}
