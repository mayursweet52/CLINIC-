"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Copy } from "lucide-react";
import { useAvailability, useTimeOff } from "@/features/schedule/hooks";
import { WeeklyGrid } from "@/features/schedule/components/WeeklyGrid";
import { SlotEditorDialog } from "@/features/schedule/components/SlotEditorDialog";
import { TimeOffList } from "@/features/schedule/components/TimeOffList";
import { MarkLeaveDialog } from "@/features/schedule/components/MarkLeaveDialog";

export default function DoctorSchedulePage() {
  const { data: availability, isLoading: availLoading } = useAvailability();
  const { data: timeOff, isLoading: toLoading } = useTimeOff();
  
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState("Monday");

  const handleAddSlot = (day: string) => {
    setSelectedDay(day);
    setSlotDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <PageHeader title="My Schedule" description="Manage your weekly availability and time off" />
        <Button onClick={() => handleAddSlot("Monday")}>
          <Plus className="mr-2 h-4 w-4" /> Add Slot
        </Button>
      </div>

      <Tabs defaultValue="weekly" className="space-y-6">
        <TabsList>
          <TabsTrigger value="weekly">Weekly Availability</TabsTrigger>
          <TabsTrigger value="timeoff">Time Off</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="m-0 space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" size="sm">
              <Copy className="mr-2 h-4 w-4" /> Copy from last week
            </Button>
          </div>
          {availLoading ? (
            <div className="h-64 flex items-center justify-center text-slate-500">Loading schedule...</div>
          ) : (
            <WeeklyGrid data={availability || []} onAddSlot={handleAddSlot} />
          )}
        </TabsContent>

        <TabsContent value="timeoff" className="m-0 space-y-4">
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Upcoming Time Off</h3>
              <Button onClick={() => setLeaveDialogOpen(true)} variant="secondary">
                Mark Leave
              </Button>
            </div>
            <TimeOffList data={timeOff || []} isLoading={toLoading} />
          </div>
        </TabsContent>
      </Tabs>

      <SlotEditorDialog 
        open={slotDialogOpen} 
        onOpenChange={setSlotDialogOpen} 
        initialDay={selectedDay} 
      />
      
      <MarkLeaveDialog 
        open={leaveDialogOpen} 
        onOpenChange={setLeaveDialogOpen} 
      />
    </div>
  );
}
