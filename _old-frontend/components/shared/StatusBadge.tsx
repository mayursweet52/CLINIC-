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
  SCHEDULED: { label: "Scheduled", className: "bg-blue-50 text-blue-700 border-blue-200" },
  CONFIRMED: { label: "Confirmed", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  ARRIVED: { label: "Arrived", className: "bg-amber-50 text-amber-700 border-amber-200" },
  IN_PROGRESS: { label: "In Progress", className: "bg-orange-50 text-orange-700 border-orange-200" },
  COMPLETED: { label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED: { label: "Cancelled", className: "bg-red-50 text-red-700 border-red-200" },
  NO_SHOW: { label: "No Show", className: "bg-slate-50 text-slate-700 border-slate-200" },
  PENDING: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
  PAID: { label: "Paid", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  DISPENSED: { label: "Dispensed", className: "bg-primary-50 text-primary-700 border-primary-200" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const config = statusConfig[status as Status] || { 
    label: status, 
    className: "bg-slate-50 text-slate-700 border-slate-200" 
  };
  
  return (
    <span 
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className, 
        className
      )}
    >
      {config.label}
    </span>
  );
}
