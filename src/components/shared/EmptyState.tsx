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
      "flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center animate-in fade-in-50",
      variant === 'error' ? "bg-destructive/5 border-destructive/20" : "bg-slate-50 dark:bg-slate-900/50"
    )}>
      <div className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full mb-4",
        variant === 'error' ? "bg-destructive/10 text-destructive" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
      )}>
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mb-1 text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}
