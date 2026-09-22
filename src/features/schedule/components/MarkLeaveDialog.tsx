"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMarkLeave } from "../hooks";

export const MarkLeaveDialog = ({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const { mutate, isPending } = useMarkLeave();

  const handleSave = () => {
    mutate({ startDate, endDate, reason }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark Leave / Time Off</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reason</Label>
            <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Vacation, Sick leave" />
          </div>
          {(startDate && endDate) && (
            <div className="bg-amber-50 text-amber-800 p-3 rounded-md text-sm">
              Preview: Existing slots in this date range will be blocked and patients notified.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={isPending || !startDate || !endDate}>Mark Leave</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
