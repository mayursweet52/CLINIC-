import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import React from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 text-center animate-in fade-in-50", 
      className
    )}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 p-4">
        <Icon className="h-8 w-8 text-slate-400" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-slate-800">{title}</h2>
      <p className="mt-1 mb-5 text-sm text-slate-500 max-w-sm">
        {description}
      </p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
}
