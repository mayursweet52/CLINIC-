import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = 
  | "SCHEDULED" 
  | "CONFIRMED" 
  | "ARRIVED" 
  | "IN_PROGRESS" 
  | "COMPLETED" 
  | "CANCELLED" 
  | "NO_SHOW" 
  | "PENDING" 
  | "PAID" 
  | "DISPENSED";

const statusConfig: Record<Status, { label: string; className: string }> = {
  SCHEDULED: { label: "Scheduled", className: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300" },
  CONFIRMED: { label: "Confirmed", className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300" },
  ARRIVED: { label: "Arrived", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300" },
  IN_PROGRESS: { label: "In Progress", className: "bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300" },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300" },
  CANCELLED: { label: "Cancelled", className: "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300" },
  NO_SHOW: { label: "No Show", className: "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300" },
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300" },
  PAID: { label: "Paid", className: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300" },
  DISPENSED: { label: "Dispensed", className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = statusConfig[status as Status] || { 
    label: status, 
    className: "bg-muted text-muted-foreground" 
  };
  
  return (
    <Badge 
      variant="outline" 
      className={cn("border-transparent font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
