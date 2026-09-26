"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";

export function DispenseDialog({ open, onOpenChange, prescription, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!prescription) return null;

  const handleDispense = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/pharmacy/dispense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prescriptionId: prescription.id,
          items: prescription.medicines.map((m: any) => ({
            name: m.name,
            quantity: m.quantity || 10, // fallback if doctor didn't provide
            batchNumber: m.batchNumber || "UNKNOWN",
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Dispense failed");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const medicineCharges = prescription.medicines.reduce((sum: number, m: any) => sum + (m.unitPrice || 0) * m.quantity, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dispense Prescription</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-error-container text-on-error-container rounded-lg text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-low rounded-lg p-4 border border-outline-variant">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                {prescription.patientName?.[0] || "?"}
              </div>
              <div>
                <h3 className="font-bold">{prescription.patientName}</h3>
                <p className="text-sm text-on-surface-variant">
                  {prescription.patientAge}y, {prescription.patientGender}
                </p>
              </div>
            </div>
            {prescription.allergies?.length > 0 && (
              <div className="mt-3">
                <span className="text-xs text-on-surface-variant mb-1 block">Allergies:</span>
                <div className="flex gap-2 flex-wrap">
                  {prescription.allergies.map((a: string) => (
                    <span key={a} className="bg-error-container text-on-error-container px-2 py-1 rounded text-xs flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-surface-low rounded-lg p-4 border border-outline-variant">
            <p className="text-sm text-on-surface-variant mb-1">Rx ID: <span className="text-on-surface font-mono">{prescription.id.slice(-8)}</span></p>
            <p className="text-sm text-on-surface-variant mb-1">Doctor: <span className="text-on-surface">{prescription.doctorName}</span></p>
            <p className="text-sm text-on-surface-variant">Diagnosis: <span className="text-on-surface">{prescription.diagnosis || "N/A"}</span></p>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-bold mb-3">Medicines</h4>
          <div className="space-y-3">
            {prescription.medicines.map((m: any, idx: number) => {
              // Mock stock for UI, backend validates real stock
              const stockStatus = Math.random() > 0.1 ? "SUFFICIENT" : "LOW";
              return (
                <div key={idx} className="bg-surface-lowest border border-outline-variant rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <h5 className="font-bold">{m.name}</h5>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {m.dosage} • {m.frequency} • {m.duration}
                    </p>
                    <div className="text-xs text-on-surface-variant mt-2 flex gap-3">
                      <span>Batch: {m.batchNumber || "PENDING"}</span>
                      {m.unitPrice && <span>Price: ₹{m.unitPrice}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                      Qty: {m.quantity || 10}
                    </span>
                    <div className="mt-3 flex items-center gap-1 text-xs font-medium">
                      {stockStatus === "SUFFICIENT" ? (
                        <span className="text-secondary flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Stock OK</span>
                      ) : (
                        <span className="text-warning flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Low Stock</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {medicineCharges > 0 && (
          <div className="mt-4 p-4 border-t border-outline-variant flex justify-between items-center font-bold text-lg">
            <span>Total Medicine Charges:</span>
            <span>₹{medicineCharges}</span>
          </div>
        )}

        <DialogFooter className="mt-6 border-t border-outline-variant pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleDispense} disabled={loading}>
            {loading ? "Verifying..." : "Verify & Dispense"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
