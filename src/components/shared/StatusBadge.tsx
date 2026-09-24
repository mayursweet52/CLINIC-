import { cn } from "@/lib/utils"

export interface StatusBadgeProps {
  status: string
  customLabel?: string
  showDot?: boolean
}

export function formatStatus(status: string): string {
  return status
    .replace(/[-_]/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

const statusConfig: Record<string, { bg: string; text: string; dot: string; dotAnim?: string }> = {
  // Appointments
  SCHEDULED: { bg: "bg-primary-100", text: "text-primary-700", dot: "bg-primary-700" },
  CONFIRMED: { bg: "bg-secondary-100", text: "text-secondary-700", dot: "bg-secondary-700" },
  ARRIVED: { bg: "bg-tertiary-100", text: "text-tertiary-700", dot: "bg-tertiary-700" },
  IN_PROGRESS: { bg: "bg-tertiary-100", text: "text-tertiary-700", dot: "bg-tertiary-700", dotAnim: "animate-pulse" },
  IN_CONSULTATION: { bg: "bg-tertiary-100", text: "text-tertiary-700", dot: "bg-tertiary-700", dotAnim: "animate-pulse" },
  COMPLETED: { bg: "bg-medical-green/10", text: "text-medical-green", dot: "bg-medical-green" },
  CANCELLED: { bg: "bg-error-container", text: "text-error", dot: "bg-error" },
  NO_SHOW: { bg: "bg-surface-high", text: "text-on-surface-variant", dot: "bg-outline" },
  
  // Billing
  PENDING: { bg: "bg-tertiary-100", text: "text-tertiary-700", dot: "bg-tertiary-700" },
  PAID: { bg: "bg-medical-green/10", text: "text-medical-green", dot: "bg-medical-green" },
  PENDING_PAYMENT: { bg: "bg-tertiary-100", text: "text-tertiary-700", dot: "bg-tertiary-700" },
  
  // Pharmacy/Inventory
  DISPENSED: { bg: "bg-secondary-100", text: "text-secondary-700", dot: "bg-secondary-700" },
  LOW_STOCK: { bg: "bg-tertiary-100", text: "text-tertiary-700", dot: "bg-tertiary-700" },
  OUT_OF_STOCK: { bg: "bg-error-container", text: "text-error", dot: "bg-error" },
  
  // Staff/General
  ACTIVE: { bg: "bg-medical-green/10", text: "text-medical-green", dot: "bg-medical-green" },
  INACTIVE: { bg: "bg-surface-high", text: "text-on-surface-variant", dot: "bg-outline" },
}

// Fallback pattern if status doesn't match
const defaultPattern = { bg: "bg-surface-high", text: "text-on-surface-variant", dot: "bg-outline" }

export function StatusBadge({ status, customLabel }: StatusBadgeProps) {
  const normalizedKey = status.toUpperCase().replace(/-/g, '_')
  const config = statusConfig[normalizedKey] || defaultPattern
  const label = customLabel || formatStatus(status)

  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 border-0",
        config.bg,
        config.text
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full shrink-0",
          config.dot,
          config.dotAnim
        )}
      />
      {label}
    </span>
  )
}
