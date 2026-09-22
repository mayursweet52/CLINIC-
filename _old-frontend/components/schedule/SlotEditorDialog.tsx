"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TimeBlock {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

interface SlotEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: TimeBlock | null;
  dayOfWeek: number;
  onSave: (data: Partial<TimeBlock>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

const generateTimeOptions = () => {
  const times = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 15) {
      const h = i.toString().padStart(2, "0");
      const m = j.toString().padStart(2, "0");
      times.push(`${h}:${m}`);
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

export function SlotEditorDialog({ open, onOpenChange, block, dayOfWeek, onSave, onDelete }: SlotEditorDialogProps) {
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [slotDuration, setSlotDuration] = useState(15);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (block) {
      setStartTime(block.startTime);
      setEndTime(block.endTime);
      setSlotDuration(block.slotDuration);
      setIsActive(block.isActive);
    } else {
      setStartTime("09:00");
      setEndTime("17:00");
      setSlotDuration(15);
      setIsActive(true);
    }
    setError(null);
  }, [block, open]);

  const handleSave = async () => {
    setError(null);
    if (startTime >= endTime) {
      setError("End time must be after start time");
      return;
    }
    setIsSaving(true);
    try {
      await onSave({
        id: block?.id,
        dayOfWeek,
        startTime,
        endTime,
        slotDuration,
        isActive
      });
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to save slot");
    } finally {
      setIsSaving(false);
    }
  };

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{block ? "Edit Availability" : "Add Availability"}</DialogTitle>
          <p className="text-sm text-muted-foreground">{days[dayOfWeek]}</p>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && <div className="text-sm text-destructive p-2 bg-destructive/10 rounded">{error}</div>}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)}
              >
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)}
              >
                {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Slot Duration (minutes)</Label>
            <select 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={slotDuration} 
              onChange={(e) => setSlotDuration(Number(e.target.value))}
            >
              <option value={10}>10 min</option>
              <option value={15}>15 min</option>
              <option value={20}>20 min</option>
              <option value={30}>30 min</option>
              <option value={60}>60 min</option>
            </select>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Label className="flex-1 cursor-pointer" htmlFor="is-active">Active</Label>
            <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          {block?.id && onDelete ? (
             <Button type="button" variant="destructive" onClick={() => { onDelete(block.id!); onOpenChange(false); }}>
               Delete
             </Button>
          ) : <div></div>}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
