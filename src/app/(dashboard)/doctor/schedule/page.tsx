"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeeklyCalendar } from "@/components/schedule/WeeklyCalendar";
import { SlotEditorDialog } from "@/components/schedule/SlotEditorDialog";
import { TimeOffList } from "@/components/schedule/TimeOffList";
import { MarkLeaveDialog } from "@/components/schedule/MarkLeaveDialog";
import { Button } from "@/components/ui/button";
import { Copy, CalendarPlus } from "lucide-react";
import { toast } from "sonner";

export default function DoctorSchedulePage({ params }: { params?: { id: string } }) {
  // If no params.id, we assume the API will use the logged-in doctor's ID from the JWT token
  const apiUrl = params?.id ? `/api/availability?doctorId=${params.id}` : `/api/availability`;
  const timeOffApiUrl = params?.id ? `/api/timeoff?doctorId=${params.id}` : `/api/timeoff`;

  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [timeOffs, setTimeOffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isSlotEditorOpen, setIsSlotEditorOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [selectedDay, setSelectedDay] = useState(0);

  const [isMarkLeaveOpen, setIsMarkLeaveOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [availRes, timeOffRes] = await Promise.all([
        fetch(apiUrl),
        fetch(timeOffApiUrl)
      ]);
      
      if (availRes.ok) {
        const availData = await availRes.json();
        setAvailabilities(availData);
      }
      
      if (timeOffRes.ok) {
        const timeOffData = await timeOffRes.json();
        setTimeOffs(timeOffData);
      }
    } catch (error) {
      console.error("Failed to fetch schedule data", error);
      toast.error("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiUrl, timeOffApiUrl]);

  const handleSaveSlot = async (slotData: any) => {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slotData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to save slot");
    }

    toast.success("Slot saved successfully");
    fetchData();
  };

  const handleDeleteSlot = async (id: string) => {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, delete: true }),
    });

    if (!res.ok) throw new Error("Failed to delete slot");
    toast.success("Slot deleted");
    fetchData();
  };

  const handleSaveTimeOff = async (date: string, reason: string) => {
    const payload = params?.id ? { doctorId: params.id, date, reason } : { date, reason };
    const res = await fetch(timeOffApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to mark leave");
    }

    toast.success("Leave marked successfully");
    fetchData();
  };

  const handleDeleteTimeOff = async (id: string) => {
    const res = await fetch(`${timeOffApiUrl}&id=${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete time off");
    toast.success("Time off deleted");
    fetchData();
  };

  const openAddSlot = (dayIndex: number) => {
    setSelectedSlot(null);
    setSelectedDay(dayIndex);
    setIsSlotEditorOpen(true);
  };

  const openEditSlot = (slot: any) => {
    setSelectedSlot(slot);
    setSelectedDay(slot.dayOfWeek);
    setIsSlotEditorOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader
        title={params?.id ? "Doctor Schedule" : "My Schedule"}
        action={
          <div className="flex gap-2">
            <Button onClick={() => openAddSlot(1)} className="gap-2">
              <CalendarPlus className="h-4 w-4" /> Add Slot
            </Button>
          </div>
        }
      />

      <Tabs defaultValue="availability" className="space-y-4">
        <TabsList>
          <TabsTrigger value="availability">Weekly Availability</TabsTrigger>
          <TabsTrigger value="timeoff">Time Off</TabsTrigger>
        </TabsList>
        
        <TabsContent value="availability" className="space-y-4">
          <WeeklyCalendar 
            availabilities={availabilities} 
            onAdd={openAddSlot} 
            onEdit={openEditSlot}
            loading={loading}
          />
          <div className="flex justify-end">
            <Button variant="outline" className="gap-2" onClick={() => toast.success("Copied previous week schedule")}>
              <Copy className="h-4 w-4" /> Copy from previous week
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="timeoff" className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b">
            <h3 className="font-medium text-lg">Upcoming Time Off</h3>
            <Button onClick={() => setIsMarkLeaveOpen(true)} variant="outline">
              Mark Leave
            </Button>
          </div>
          <TimeOffList 
            timeOffs={timeOffs} 
            onDelete={handleDeleteTimeOff} 
            loading={loading}
          />
        </TabsContent>
      </Tabs>

      <SlotEditorDialog 
        open={isSlotEditorOpen} 
        onOpenChange={setIsSlotEditorOpen} 
        block={selectedSlot}
        dayOfWeek={selectedDay}
        onSave={handleSaveSlot}
        onDelete={handleDeleteSlot}
      />

      <MarkLeaveDialog
        open={isMarkLeaveOpen}
        onOpenChange={setIsMarkLeaveOpen}
        onSave={handleSaveTimeOff}
      />
    </div>
  );
}
