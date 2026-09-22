import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  delta?: { 
    value: string; 
    isUp: boolean 
  };
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = "text-primary-600", 
  iconBgColor = "bg-primary-50",
  delta, 
  className 
}: StatCardProps) {
  return (
    <div className={cn("p-5 rounded-lg border border-slate-200 bg-white shadow-sm flex flex-col", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {title}
        </h3>
        <div className={cn("p-2.5 rounded-lg", iconBgColor)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
      <div>
        <div className="text-3xl font-bold tracking-tight text-slate-900">{value}</div>
        {delta && (
          <p className="flex items-center text-xs mt-1">
            {delta.isUp ? (
              <TrendingUp className="mr-1 h-3 w-3 text-emerald-600" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
            )}
            <span 
              className={cn(
                "font-medium mr-1",
                delta.isUp ? "text-emerald-600" : "text-red-600"
              )}
            >
              {delta.value}
            </span>
            <span className="text-slate-500">vs last month</span>
          </p>
        )}
      </div>
    </div>
  );
}
