import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  iconVariant?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  trend?: { value: string; isUp: boolean }
  hint?: string
}

const variantStyles = {
  primary: "bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300",
  success: "bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-300",
  warning: "bg-warning-100 text-warning-700 dark:bg-warning-900/50 dark:text-warning-300",
  danger: "bg-danger-100 text-danger-700 dark:bg-danger-900/50 dark:text-danger-300",
  info: "bg-info-100 text-info-700 dark:bg-info-900/50 dark:text-info-300",
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconVariant = 'primary',
  trend,
  hint
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <div className={cn("rounded-lg p-2.5", variantStyles[iconVariant])}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          {trend && (
            <p className={cn("text-xs font-medium", trend.isUp ? "text-success" : "text-danger")}>
              {trend.isUp ? "↑" : "↓"} {trend.value}
              {hint && <span className="ml-1 font-normal text-muted-foreground">{hint}</span>}
            </p>
          )}
          {!trend && hint && (
            <p className="text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
