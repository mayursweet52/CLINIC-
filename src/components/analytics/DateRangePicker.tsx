"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const options = [
    { label: "7D", value: "7d" },
    { label: "30D", value: "30d" },
    { label: "90D", value: "90d" },
    { label: "1Y", value: "1y" },
  ];

  return (
    <div className={cn("inline-flex items-center rounded-md border p-1 bg-muted/20", className)}>
      {options.map((opt) => (
        <Button
          key={opt.value}
          variant={value === opt.value ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onChange(opt.value)}
          className={cn(
            "h-7 px-3 text-xs",
            value === opt.value ? "shadow-sm bg-background hover:bg-background" : "hover:bg-muted"
          )}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
