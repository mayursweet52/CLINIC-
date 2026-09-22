"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useMarkPaid } from "../hooks";

export const MarkPaidDialog = ({
  open,
  onOpenChange,
  invoiceId,
  amount
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  amount: number;
}) => {
  const [method, setMethod] = useState("cash");
  const { mutate: markPaid, isPending } = useMarkPaid();

  const handleConfirm = () => {
    markPaid({ id: invoiceId, method }, {
      onSuccess: () => onOpenChange(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as Paid</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg flex justify-between items-center border">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Amount Due:</span>
            <span className="text-2xl font-mono tracking-tight font-semibold">₹{amount.toLocaleString()}</span>
          </div>
          
          <div className="space-y-3">
            <Label>Payment Method</Label>
            <RadioGroup value={method} onValueChange={setMethod} className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 border p-3 rounded-md has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="cursor-pointer flex-1">Cash</Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-md has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="cursor-pointer flex-1">Card</Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-md has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="cursor-pointer flex-1">UPI</Label>
              </div>
              <div className="flex items-center space-x-2 border p-3 rounded-md has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50">
                <RadioGroupItem value="razorpay" id="razorpay" />
                <Label htmlFor="razorpay" className="cursor-pointer flex-1">Razorpay</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Processing..." : "Confirm Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
