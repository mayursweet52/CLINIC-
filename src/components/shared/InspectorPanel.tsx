import React from "react"
import { StatusBadge } from "./StatusBadge"

export interface InspectorPanelProps {
  title: string;
  subtitle?: string;
  status?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function InspectorPanel({ 
  title, 
  subtitle, 
  status, 
  children, 
  actions 
}: InspectorPanelProps) {
  return (
    <div className="bg-surface-lowest rounded-xl shadow-sm p-6 flex flex-col gap-4 border border-outline-variant/20">
      <div className="flex items-start justify-between pb-3 border-b border-outline-variant/20">
        <div className="min-w-0 pr-4">
          <h3 className="text-lg font-semibold text-on-surface truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-on-surface-variant mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
        {status && <StatusBadge status={status} />}
      </div>
      <div className="flex-1 space-y-4">{children}</div>
      {actions && (
        <div className="pt-3 border-t border-outline-variant/20 flex gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
