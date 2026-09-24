import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  color?: "primary" | "secondary" | "tertiary" | "success" | "error" | "info"
  iconVariant?: string // for backwards compatibility
  trend?: { value: string; isUp: boolean }
  hint?: string
}

const colorStyles = {
  primary: "bg-primary-100 text-primary-700",
  secondary: "bg-secondary-100 text-secondary-700",
  tertiary: "bg-tertiary-100 text-tertiary-700",
  success: "bg-medical-green/10 text-medical-green",
  error: "bg-error-container text-on-error",
  info: "bg-surface-high text-primary-500",
}

export function StatCard({
  label,
  value,
  icon: Icon,
  color,
  iconVariant,
  trend,
  hint
}: StatCardProps) {
  const activeColor = (color || iconVariant || "primary") as keyof typeof colorStyles;
  
  return (
    <div className="bg-surface-lowest rounded-xl p-5 shadow-sm border border-outline-variant/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">
            {label}
          </p>
          <div className="text-3xl font-semibold tracking-tight mt-1 text-on-surface">{value}</div>
          {trend && (
            <p className={cn("text-xs font-semibold mt-1", trend.isUp ? "text-medical-green" : "text-error")}>
              {trend.isUp ? "↑" : "↓"} {trend.value}
              {hint && <span className="ml-1 font-normal text-on-surface-variant">{hint}</span>}
            </p>
          )}
          {!trend && hint && (
            <p className="text-xs text-on-surface-variant mt-1">{hint}</p>
          )}
        </div>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", colorStyles[activeColor] || colorStyles.primary)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
