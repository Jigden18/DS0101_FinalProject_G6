import { FileX, Users, Briefcase, ClipboardList } from "lucide-react"

type EmptyStateType = "listings" | "applications" | "users" | "applicants" | "default"

const emptyStateConfig: Record<EmptyStateType, { icon: typeof FileX; title: string; description: string }> = {
  listings: {
    icon: Briefcase,
    title: "No listings found",
    description: "There are no job listings available at the moment.",
  },
  applications: {
    icon: ClipboardList,
    title: "No applications yet",
    description: "You haven't submitted any applications yet.",
  },
  users: {
    icon: Users,
    title: "No users found",
    description: "There are no users in this category.",
  },
  applicants: {
    icon: Users,
    title: "No applicants yet",
    description: "No one has applied to this listing yet.",
  },
  default: {
    icon: FileX,
    title: "Nothing here",
    description: "No data available.",
  },
}

interface EmptyStateProps {
  type?: EmptyStateType
  title?: string
  description?: string
}

export function EmptyState({ type = "default", title, description }: EmptyStateProps) {
  const config = emptyStateConfig[type]
  const Icon = config.icon

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {title || config.title}
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        {description || config.description}
      </p>
    </div>
  )
}
