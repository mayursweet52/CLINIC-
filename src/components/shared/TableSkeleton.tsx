import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
}

export function TableSkeleton({ rows = 5, cols = 4 }: TableSkeletonProps) {
  return (
    <div className="w-full rounded-md border">
      {/* Header Row */}
      <div className="flex border-b bg-muted/50 p-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex-1 px-2">
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      {/* Body Rows */}
      {Array.from({ length: rows }).map((_, rIndex) => (
        <div key={rIndex} className="flex border-b p-4 last:border-0">
          {Array.from({ length: cols }).map((_, cIndex) => (
            <div key={cIndex} className="flex-1 px-2">
              <Skeleton className="h-4 w-full max-w-[80%]" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
