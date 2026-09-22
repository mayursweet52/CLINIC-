"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateSlot } from "../hooks";

export const SlotEditorDialog = ({ open, onOpenChange, initialDay }: { open: boolean, onOpenChange: (o: boolean) => void, initialDay?: string }) => {
  const [day, setDay] = useState(initialDay || "Monday");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("13:00");
  const [duration, setDuration] = useState("15");
  const [error, setError] = useState("");

  const { mutate, isPending } = useCreateSlot();

  const handleSave = () => {
    if (endTime <= startTime) {
      setError("End time must be after start time");
      return;
    }
    setError("");
    mutate({ day, startTime, endTime, duration }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Availability Slot</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {error && <div className="text-sm text-red-500">{error}</div>}
          <div className="space-y-2">
            <Label>Day of Week</Label>
            <Select value={day} onValueChange={setDay}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Slot Duration (mins)</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 mins</SelectItem>
                <SelectItem value="15">15 mins</SelectItem>
                <SelectItem value="20">20 mins</SelectItem>
                <SelectItem value="30">30 mins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isPending}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
