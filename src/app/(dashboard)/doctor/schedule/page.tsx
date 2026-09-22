"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Plus,
  X,
  Calendar as CalendarIcon,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  return `${h.toString().padStart(2, "0")}:${m}`;
});

export default function DoctorSchedulePage({
  params,
}: {
  params?: { id: string };
}) {
  const [activeTab, setActiveTab] = useState("weekly");
  const [availabilities, setAvailabilities] = useState<any[]>([]);
  const [timeOffs, setTimeOffs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [slotDialog, setSlotDialog] = useState<{
    open: boolean;
    dayIndex: number;
    slot: any;
  }>({ open: false, dayIndex: 1, slot: null });
  const [leaveDialog, setLeaveDialog] = useState(false);

  // Forms state
  const [slotForm, setSlotForm] = useState({
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 15,
  });
  const [slotError, setSlotError] = useState("");

  const [leaveForm, setLeaveForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });

  const startDate = startOfWeek(new Date());

  useEffect(() => {
    // Mock data for redesign
    setTimeout(() => {
      setAvailabilities([
        {
          id: "1",
          dayOfWeek: 1,
          startTime: "09:00",
          endTime: "13:00",
          slotDuration: 15,
        },
        {
          id: "2",
          dayOfWeek: 1,
          startTime: "14:00",
          endTime: "18:00",
          slotDuration: 15,
        },
        {
          id: "3",
          dayOfWeek: 2,
          startTime: "10:00",
          endTime: "16:00",
          slotDuration: 20,
        },
        {
          id: "4",
          dayOfWeek: 3,
          startTime: "09:00",
          endTime: "14:00",
          slotDuration: 15,
        },
        {
          id: "5",
          dayOfWeek: 4,
          startTime: "11:00",
          endTime: "19:00",
          slotDuration: 15,
        },
        {
          id: "6",
          dayOfWeek: 5,
          startTime: "09:00",
          endTime: "17:00",
          slotDuration: 15,
        },
      ]);
      setTimeOffs([
        {
          id: "1",
          startDate: "2026-10-15",
          endDate: "2026-10-20",
          reason: "Annual Vacation",
          status: "APPROVED",
        },
        {
          id: "2",
          startDate: "2026-11-02",
          endDate: "2026-11-02",
          reason: "Personal Work",
          status: "PENDING",
        },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  const openAddSlot = (dayIndex: number) => {
    setSlotForm({ startTime: "09:00", endTime: "17:00", slotDuration: 15 });
    setSlotError("");
    setSlotDialog({ open: true, dayIndex, slot: null });
  };

  const openEditSlot = (dayIndex: number, slot: any) => {
    setSlotForm({
      startTime: slot.startTime,
      endTime: slot.endTime,
      slotDuration: slot.slotDuration,
    });
    setSlotError("");
    setSlotDialog({ open: true, dayIndex, slot });
  };

  const handleSaveSlot = () => {
    if (slotForm.endTime <= slotForm.startTime) {
      setSlotError("End time must be after start time");
      return;
    }

    const { dayIndex, slot } = slotDialog;
    const daySlots = availabilities.filter(
      (a) => a.dayOfWeek === dayIndex && a.id !== slot?.id,
    );

    // Check overlap
    const hasOverlap = daySlots.some((a) => {
      return slotForm.startTime < a.endTime && slotForm.endTime > a.startTime;
    });

    if (hasOverlap) {
      setSlotError("This slot overlaps with an existing slot");
      return;
    }

    if (slot) {
      setAvailabilities((prev) =>
        prev.map((a) => (a.id === slot.id ? { ...a, ...slotForm } : a)),
      );
      toast.success("Slot updated successfully");
    } else {
      setAvailabilities((prev) => [
        ...prev,
        { id: Math.random().toString(), dayOfWeek: dayIndex, ...slotForm },
      ]);
      toast.success("Slot added successfully");
    }
    setSlotDialog({ open: false, dayIndex: 0, slot: null });
  };

  const handleDeleteSlot = () => {
    setAvailabilities((prev) =>
      prev.filter((a) => a.id !== slotDialog.slot.id),
    );
    toast.success("Slot deleted");
    setSlotDialog({ open: false, dayIndex: 0, slot: null });
  };

  const handleSaveTimeOff = () => {
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      toast.error("Please fill all fields");
      return;
    }
    setTimeOffs((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        reason: leaveForm.reason,
        status: "PENDING",
      },
    ]);

    toast.success("Leave marked successfully");
    // Simulate real-time event
    console.log("Publishing 'doctor.leave.marked' event");

    setLeaveDialog(false);
    setLeaveForm({ startDate: "", endDate: "", reason: "" });
  };

  const handleDeleteTimeOff = (id: string) => {
    if (confirm("Are you sure you want to cancel this leave?")) {
      setTimeOffs((prev) => prev.filter((t) => t.id !== id));
      toast.success("Leave cancelled");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={params?.id ? "Doctor Schedule" : "My Schedule"}
        action={
          <Button
            onClick={() => openAddSlot(1)}
            className="bg-primary-600 hover:bg-primary-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Slot
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="weekly">Weekly Availability</TabsTrigger>
          <TabsTrigger value="timeoff">Time Off</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-end mb-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => toast.success("Copied schedule from last week")}
              >
                <Copy className="mr-2 h-3.5 w-3.5" /> Copy from last week
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-3">
              {DAYS.map((dayName, dayIndex) => {
                const daySlots = availabilities
                  .filter((a) => a.dayOfWeek === dayIndex)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));
                const date = addDays(startDate, dayIndex);

                return (
                  <div key={dayIndex} className="flex flex-col">
                    <div className="text-center mb-4">
                      <p className="text-xs uppercase font-medium text-slate-500 mb-1">
                        {dayName.substring(0, 3)}
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {format(date, "dd")}
                      </p>
                    </div>

                    {loading ? (
                      <div className="h-24 bg-slate-100 rounded-lg animate-pulse" />
                    ) : daySlots.length > 0 ? (
                      <div className="space-y-2">
                        {daySlots.map((slot) => (
                          <div
                            key={slot.id}
                            onClick={() => openEditSlot(dayIndex, slot)}
                            className="p-2 rounded-lg bg-primary-50 border border-primary-200 text-xs font-medium text-primary-700 hover:shadow-sm cursor-pointer transition-all text-center"
                          >
                            {slot.startTime} &ndash; {slot.endTime}
                          </div>
                        ))}
                        <button
                          onClick={() => openAddSlot(dayIndex)}
                          className="w-full py-2 flex justify-center text-slate-400 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => openAddSlot(dayIndex)}
                        className="border-2 border-dashed border-slate-200 hover:border-primary-300 rounded-lg py-6 text-xs text-slate-400 hover:text-primary-600 hover:bg-slate-50 text-center cursor-pointer transition-colors flex flex-col items-center justify-center h-full min-h-[100px]"
                      >
                        <Plus className="h-4 w-4 mb-1 opacity-50" />
                        Click to add
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeoff">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Scheduled Leaves</h2>
              <Button onClick={() => setLeaveDialog(true)} variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" /> Mark Leave
              </Button>
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                <div className="h-16 bg-slate-100 rounded-xl animate-pulse" />
              </div>
            ) : timeOffs.length > 0 ? (
              <div className="space-y-3">
                {timeOffs.map((leave) => (
                  <div
                    key={leave.id}
                    className="p-4 rounded-xl border border-slate-200 flex justify-between items-center group hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 mb-1">
                        {format(new Date(leave.startDate), "dd MMM yyyy")}
                        {leave.startDate !== leave.endDate &&
                          ` - ${format(new Date(leave.endDate), "dd MMM yyyy")}`}
                      </p>
                      <p className="text-sm text-slate-600">{leave.reason}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={leave.status} />
                      <button
                        onClick={() => handleDeleteTimeOff(leave.id)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={CalendarIcon}
                title="No upcoming leaves"
                description="You have no time off scheduled"
              />
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Slot Dialog */}
      <Dialog
        open={slotDialog.open}
        onOpenChange={(open) =>
          !open && setSlotDialog({ ...slotDialog, open: false })
        }
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {slotDialog.slot ? "Edit Slot" : "Add Slot"}
            </DialogTitle>
            <DialogDescription>
              Configure availability for {DAYS[slotDialog.dayIndex]}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {slotError && (
              <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5" /> {slotError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase">
                  Start Time
                </label>
                <select
                  value={slotForm.startTime}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, startTime: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase">
                  End Time
                </label>
                <select
                  value={slotForm.endTime}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, endTime: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase">
                Slot Duration (Mins)
              </label>
              <select
                value={slotForm.slotDuration}
                onChange={(e) =>
                  setSlotForm({
                    ...slotForm,
                    slotDuration: Number(e.target.value),
                  })
                }
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
            {slotDialog.slot ? (
              <Button
                type="button"
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleDeleteSlot}
              >
                Delete
              </Button>
            ) : (
              <div></div>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSlotDialog({ ...slotDialog, open: false })}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleSaveSlot}
                className="bg-primary-600 hover:bg-primary-700 text-white"
              >
                Save Slot
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark Leave Dialog */}
      <Dialog open={leaveDialog} onOpenChange={setLeaveDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mark Leave</DialogTitle>
            <DialogDescription>
              Block your calendar for planned time off.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase">
                  Start Date
                </label>
                <input
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, startDate: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600 uppercase">
                  End Date
                </label>
                <input
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(e) =>
                    setLeaveForm({ ...leaveForm, endDate: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 uppercase">
                Reason
              </label>
              <textarea
                value={leaveForm.reason}
                onChange={(e) =>
                  setLeaveForm({ ...leaveForm, reason: e.target.value })
                }
                placeholder="E.g., Personal Vacation"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none h-20 resize-none"
              />
            </div>

            {(leaveForm.startDate || leaveForm.endDate) && (
              <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm font-medium border border-blue-100 flex items-start gap-2">
                <CalendarIcon className="w-4 h-4 mt-0.5 opacity-70" />
                <span>
                  Existing appointments in this period will be marked for
                  rescheduling, and slots will be blocked.
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setLeaveDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveTimeOff}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              Mark Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
