import { cn } from "@/lib/utils"

export interface TableSkeletonProps {
  rows?: number
  cols?: number
  hasHeader?: boolean
}

export function TableSkeleton({ rows = 5, cols = 4, hasHeader = true }: TableSkeletonProps) {
  return (
    <div className="w-full">
      {hasHeader && (
        <div className="flex gap-4 mb-3">
          {Array.from({ length: cols }).map((_, i) => (
            <div key={`header-${i}`} className="flex-1 h-8 bg-surface-high rounded-lg animate-pulse" />
          ))}
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="h-12 w-full bg-surface-low rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  )
}
