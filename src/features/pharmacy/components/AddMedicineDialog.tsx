"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddMedicine } from "../hooks";

export function AddMedicineDialog({ open, onOpenChange }: any) {
  const [formData, setFormData] = useState({ name: "", batch: "", qty: "", price: "", expiry: "" });
  const addMedicine = useAddMedicine();

  const handleSubmit = async () => {
    if (!formData.name) return;
    await addMedicine.mutateAsync({
      name: formData.name,
      batch: formData.batch,
      qty: parseInt(formData.qty) || 0,
      price: parseFloat(formData.price) || 0,
      expiry: formData.expiry
    });
    setFormData({ name: "", batch: "", qty: "", price: "", expiry: "" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Medicine</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Input 
            placeholder="Medicine Name (e.g. Paracetamol 500mg)" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <Input 
            placeholder="Batch Number" 
            value={formData.batch}
            onChange={(e) => setFormData({...formData, batch: e.target.value})}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              type="number" 
              placeholder="Quantity" 
              value={formData.qty}
              onChange={(e) => setFormData({...formData, qty: e.target.value})}
            />
            <Input 
              type="number" 
              placeholder="Unit Price" 
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
            />
          </div>
          <Input 
            type="date" 
            placeholder="Expiry Date" 
            value={formData.expiry}
            onChange={(e) => setFormData({...formData, expiry: e.target.value})}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={addMedicine.isPending || !formData.name}>
            {addMedicine.isPending ? "Adding..." : "Add Medicine"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
