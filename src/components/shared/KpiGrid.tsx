import { ReactNode } from "react"
import { StatCard, StatCardProps } from "./StatCard"
import { cn } from "@/lib/utils"

export interface KpiGridProps {
  items: StatCardProps[]
  cols?: 2 | 3 | 4
}

export function KpiGrid({ items, cols = 4 }: KpiGridProps) {
  return (
    <div className={cn(
      "grid gap-4",
      cols === 2 && "grid-cols-1 md:grid-cols-2",
      cols === 3 && "grid-cols-1 md:grid-cols-3",
      cols === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
    )}>
      {items.map((item, index) => (
        <StatCard key={index} {...item} />
      ))}
    </div>
  )
}
