"use client";

import { useState } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { SlotEditorDialog } from "./SlotEditorDialog";

interface TimeBlock {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

interface WeeklyCalendarProps {
  availabilities: TimeBlock[];
  onAdd: (day: number) => void;
  onEdit: (block: TimeBlock) => void;
  loading: boolean;
}

export function WeeklyCalendar({ availabilities, onAdd, onEdit, loading }: WeeklyCalendarProps) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getBlocksForDay = (dayIndex: number) => {
    return availabilities.filter((a) => a.dayOfWeek === dayIndex).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  if (loading) {
    return <div className="animate-pulse h-[400px] bg-muted rounded-md" />;
  }

  return (
    <div className="border rounded-md overflow-hidden bg-background">
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {days.map((day, i) => (
          <div key={day} className="p-3 text-center font-medium text-sm border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 min-h-[300px]">
        {days.map((_, dayIndex) => {
          const dayBlocks = getBlocksForDay(dayIndex);
          return (
            <div key={dayIndex} className="border-r last:border-r-0 p-2 space-y-2 relative group">
              {dayBlocks.length > 0 ? (
                dayBlocks.map((block) => (
                  <div
                    key={block.id}
                    onClick={() => onEdit(block)}
                    className={`p-2 text-xs rounded-md border cursor-pointer hover:border-primary transition-colors ${
                      block.isActive ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <div className="font-medium">
                      {block.startTime} - {block.endTime}
                    </div>
                    <div className="text-[10px] opacity-80">{block.slotDuration}m slots</div>
                  </div>
                ))
              ) : (
                <div 
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-muted/20 cursor-pointer"
                  onClick={() => onAdd(dayIndex)}
                >
                  <span className="text-xs text-muted-foreground font-medium">+ Add</span>
                </div>
              )}
              {dayBlocks.length > 0 && (
                <div 
                  className="pt-2 text-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Button variant="ghost" size="sm" className="h-6 text-xs w-full" onClick={() => onAdd(dayIndex)}>
                    + Add
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
