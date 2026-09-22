interface TableSkeletonProps {
  rows?: number;
  cols?: number; // Kept for backward compatibility with existing usage
}

export function TableSkeleton({ rows = 5 }: TableSkeletonProps) {
  return (
    <div className="w-full space-y-3">
      {Array.from({ length: rows }).map((_, rIndex) => (
        <div 
          key={rIndex} 
          className="h-12 w-full rounded-lg bg-slate-100 animate-pulse"
        />
      ))}
    </div>
  );
}
