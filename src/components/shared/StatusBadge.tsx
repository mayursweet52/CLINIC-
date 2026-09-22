import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { STATUS_COLORS } from "@/lib/constants"

export type StatusVariant = 
  | 'scheduled' | 'confirmed' | 'arrived' | 'in-progress' 
  | 'completed' | 'cancelled' | 'no-show' 
  | 'pending' | 'paid' | 'partial' | 'refunded'
  | 'dispensed' | 'in-stock' | 'low-stock' | 'out-of-stock'
  | 'active' | 'inactive'

interface StatusBadgeProps {
  status: StatusVariant | string
  className?: string
  showDot?: boolean
}

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  const variant = STATUS_COLORS[status.toLowerCase()] || "default"
  
  return (
    <Badge 
      variant={variant as any} 
      className={cn("capitalize whitespace-nowrap", className)}
      aria-label={`Status: ${status}`}
    >
      {showDot && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      )}
      {status.replace(/-/g, ' ')}
    </Badge>
  )
}
