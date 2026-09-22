"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDispense } from "../hooks";

export const DispenseDialog = ({
  open,
  onOpenChange,
  prescription
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: any;
}) => {
  const { mutate: dispense, isPending } = useDispense();

  if (!prescription) return null;

  const handleDispense = () => {
    dispense(prescription.id, {
      onSuccess: () => onOpenChange(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Dispense Prescription: {prescription.id}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
            <div>
              <span className="text-slate-500 block mb-1">Patient</span>
              <span className="font-medium text-slate-900">{prescription.patientName}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Doctor</span>
              <span className="font-medium text-slate-900">{prescription.doctorName}</span>
            </div>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-slate-500">Medicine</th>
                  <th className="text-left p-3 font-medium text-slate-500">Dose</th>
                  <th className="text-left p-3 font-medium text-slate-500">Freq</th>
                  <th className="text-left p-3 font-medium text-slate-500">Duration</th>
                  <th className="text-right p-3 font-medium text-slate-500">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {prescription.medicines.map((med: any) => (
                  <tr key={med.id}>
                    <td className="p-3 font-medium">{med.name}</td>
                    <td className="p-3">{med.dose}</td>
                    <td className="p-3">{med.frequency}</td>
                    <td className="p-3">{med.duration}</td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        med.stockStatus === 'In Stock' ? 'bg-emerald-100 text-emerald-700' :
                        med.stockStatus === 'Low Stock' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {med.stockStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>Cancel</Button>
          <Button onClick={handleDispense} disabled={isPending}>
            {isPending ? "Dispensing..." : "Dispense All"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
