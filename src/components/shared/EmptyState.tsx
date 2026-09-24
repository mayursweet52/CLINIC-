import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  variant?: 'default' | 'error'
}

export function EmptyState({ icon: Icon, title, description, action, variant = 'default' }: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-4 text-center rounded-xl",
      variant === 'error' ? "bg-error-container/20 border border-error/20" : "bg-transparent"
    )}>
      <div className={cn(
        "w-16 h-16 rounded-full flex items-center justify-center mb-4",
        variant === 'error' ? "bg-error-container text-error" : "bg-surface-low text-on-surface-variant"
      )}>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-semibold text-on-surface mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-on-surface-variant max-w-sm mb-0">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
