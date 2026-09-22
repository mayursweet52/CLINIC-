"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface MarkLeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (date: string, reason: string) => Promise<void>;
}

export function MarkLeaveDialog({ open, onOpenChange, onSave }: MarkLeaveDialogProps) {
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setError(null);
    if (!date) {
      setError("Date is required");
      return;
    }
    setIsSaving(true);
    try {
      await onSave(date, reason);
      setDate("");
      setReason("");
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to mark leave");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark Time Off</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && <div className="text-sm text-destructive p-2 bg-destructive/10 rounded">{error}</div>}
          
          <div className="space-y-2">
            <Label>Date</Label>
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Reason (Optional)</Label>
            <Input 
              type="text" 
              placeholder="e.g. Sick leave, Vacation"
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Leave"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
