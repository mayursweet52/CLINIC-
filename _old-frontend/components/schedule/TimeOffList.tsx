"use client";

import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimeOff {
  id: string;
  date: string;
  reason: string | null;
}

interface TimeOffListProps {
  timeOffs: TimeOff[];
  onDelete: (id: string) => Promise<void>;
  loading: boolean;
}

export function TimeOffList({ timeOffs, onDelete, loading }: TimeOffListProps) {
  if (loading) {
    return <div className="animate-pulse h-[200px] bg-muted rounded-md" />;
  }

  if (timeOffs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-md bg-muted/20 text-muted-foreground">
        <p>No upcoming time off</p>
      </div>
    );
  }

  const sortedTimeOffs = [...timeOffs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="border rounded-md divide-y">
      {sortedTimeOffs.map((leave) => (
        <div key={leave.id} className="flex items-center justify-between p-4 bg-background">
          <div>
            <div className="font-medium">{format(new Date(leave.date), "EEEE, MMMM d, yyyy")}</div>
            {leave.reason && <div className="text-sm text-muted-foreground mt-1">{leave.reason}</div>}
          </div>
          <Button variant="ghost" size="icon" onClick={() => onDelete(leave.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
