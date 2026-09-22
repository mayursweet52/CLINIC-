"use client";

import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export const WeeklyGrid = ({ data, onAddSlot }: { data: any[], onAddSlot: (day: string) => void }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {DAYS.map(day => {
        const daySlots = data?.filter(s => s.dayOfWeek === day) || [];
        return (
          <div key={day} className="border rounded-xl p-3 bg-white min-h-[300px]">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">
              {day}
            </div>
            <div className="space-y-3">
              {daySlots.map(slot => (
                <div key={slot.id} className="bg-primary-50 border border-primary-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                  <div className="font-medium text-primary-900 text-sm">{slot.startTime} - {slot.endTime}</div>
                  <div className="text-primary-700 text-xs mt-1">{slot.duration} min / slot</div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full border-dashed text-slate-500 hover:text-primary-600 hover:bg-primary-50 mt-2"
                onClick={() => onAddSlot(day)}
              >
                <Plus className="h-4 w-4 mr-2" /> Add
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
