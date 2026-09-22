"use client";

import { useState, useEffect } from "react";
import { Pill, CheckCircle, AlertCircle, ShoppingBag, DollarSign } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PermissionGate } from "@/components/shared/PermissionGate";

export default function PharmacyDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [invLoading, setInvLoading] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
    fetchInventory();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await fetch("/api/appointments");
      const data = await res.json();
      if (Array.isArray(data)) {
        const pharmacyQueue = data.filter((a: any) => 
          (a.status === "COMPLETED" || a.rawStatus === "COMPLETED" || a.status === "Completed") && 
          a.prescriptions && 
          a.prescriptions.length > 0
        );
        setAppointments(pharmacyQueue);
        setSelectedAppt((prev: any) => {
          if (!prev && pharmacyQueue.length > 0) return pharmacyQueue[0];
          if (prev) {
            const stillExists = pharmacyQueue.find((a: any) => a.id === prev.id);
            return stillExists || (pharmacyQueue.length > 0 ? pharmacyQueue[0] : null);
          }
          return null;
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchInventory = async () => {
    setInvLoading(true);
    try {
      // Mock inventory fetch since there may not be an api/pharmacy/inventory route yet
      const res = await fetch("/api/pharmacy").catch(() => null);
      if (res && res.ok) {
        setInventory(await res.json());
      } else {
        // Fallback mock data
        setInventory([
          { id: '1', name: 'Amoxicillin', stockQuantity: 50, reorderLevel: 20 },
          { id: '2', name: 'Paracetamol', stockQuantity: 15, reorderLevel: 50 },
          { id: '3', name: 'Ibuprofen', stockQuantity: 5, reorderLevel: 10 },
        ]);
      }
    } finally {
      setInvLoading(false);
    }
  };

  const calculateQuantity = (dosage: string, durationDays: number) => {
    const match = dosage.match(/\d+/g);
    if (!match) return durationDays;
    const timesPerDay = match.reduce((sum, num) => sum + parseInt(num, 10), 0);
    return (timesPerDay || 1) * durationDays;
  };

  const handleDispense = async () => {
    if (!selectedAppt) return;
    setLoading(true);

    try {
      const dispenseItems = selectedAppt.prescriptions.map((p: any) => ({
        medicineId: p.medicineId,
        quantity: calculateQuantity(p.dosage, p.durationDays)
      }));

      const res = await fetch("/api/pharmacy/dispense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: selectedAppt.id,
          items: dispenseItems
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Medicines Dispensed Successfully! Bill has been updated.");
        setSelectedAppt(null);
        await fetchPrescriptions();
        await fetchInventory();
      } else {
        toast.error("Error: " + (result.error || "Dispense failed"));
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Pharmacy Dashboard" 
        description="Manage prescriptions, dispensing, and inventory"
      />

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="queue">Pending Dispense</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          <div className="flex h-[calc(100vh-220px)] min-h-[500px] gap-6 rounded-xl overflow-hidden">
            
            {/* LEFT: Pharmacy Queue */}
            <div className="w-[350px] bg-card border rounded-xl flex flex-col overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center bg-muted/30">
                <h2 className="font-semibold flex items-center gap-2 text-sm">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" /> Pending Queue
                </h2>
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {appointments.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {appointments.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-20 text-emerald-500" />
                    <p className="text-sm">No pending prescriptions</p>
                  </div>
                ) : (
                  appointments.map((appt) => (
                    <div 
                      key={appt.id}
                      onClick={() => setSelectedAppt(appt)}
                      className={`p-4 rounded-xl cursor-pointer transition-all border text-sm ${selectedAppt?.id === appt.id ? 'bg-emerald-50/50 border-emerald-300 shadow-sm' : 'bg-background hover:border-slate-300'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold">#{appt.tokenNumber || 'N/A'}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md">
                          {appt.prescriptions.length} Meds
                        </span>
                      </div>
                      <h3 className="font-medium">{appt.patient?.name || appt.patientName || 'Unknown Patient'}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">Dr. {appt.doctor?.name || appt.doctor || "Smith"}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT: Prescription Details */}
            <div className="flex-1 bg-card border rounded-xl overflow-hidden flex flex-col">
              {!selectedAppt ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                  <Pill className="w-12 h-12 mb-4 opacity-20" />
                  <h3 className="text-lg font-semibold mb-1">Pharmacy Counter</h3>
                  <p className="text-sm">Select a patient to dispense medicines.</p>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="p-5 border-b bg-muted/10 flex justify-between items-center">
                    <div>
                      <h1 className="text-xl font-semibold">{selectedAppt.patient?.name || selectedAppt.patientName}</h1>
                      <p className="text-sm text-muted-foreground mt-1">
                        Token: <span className="font-medium text-foreground">#{selectedAppt.tokenNumber}</span> &bull; 
                        Dr. <span className="font-medium text-foreground">{selectedAppt.doctor?.name || selectedAppt.doctor || "Smith"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5">
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 border-b">
                          <tr>
                            <th className="p-3 font-medium text-muted-foreground">Medicine</th>
                            <th className="p-3 font-medium text-muted-foreground text-center">Dosage</th>
                            <th className="p-3 font-medium text-muted-foreground text-center">Qty</th>
                            <th className="p-3 font-medium text-muted-foreground text-right">In Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {selectedAppt.prescriptions.map((p: any, idx: number) => {
                            const requiredQty = calculateQuantity(p.dosage, p.durationDays);
                            const currentStock = p.medicine?.stockQuantity ?? p.medicine?.stock ?? 100;
                            const isLowStock = currentStock < requiredQty;

                            return (
                              <tr key={idx} className="bg-background">
                                <td className="p-3 font-medium">
                                  {p.medicine?.name || p.medicineName || "Medicine"}
                                  <div className="text-xs text-muted-foreground font-normal mt-0.5">{p.instructions || "No special instructions"}</div>
                                </td>
                                <td className="p-3 text-center">{p.dosage} x {p.durationDays}d</td>
                                <td className="p-3 text-center font-semibold">{requiredQty}</td>
                                <td className="p-3 text-right">
                                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isLowStock ? 'bg-destructive/10 text-destructive' : 'bg-emerald-100 text-emerald-700'}`}>
                                    {currentStock} {isLowStock && <AlertCircle className="w-3 h-3 inline ml-1" />}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="p-5 border-t bg-muted/10 flex justify-between items-center">
                    <div className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-600" /> Auto-added to final bill
                    </div>
                    <PermissionGate permission="pharmacy:dispense">
                      <Button onClick={handleDispense} disabled={loading} size="lg">
                        {loading ? "Processing..." : "Dispense & Bill"}
                      </Button>
                    </PermissionGate>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="rounded-xl border bg-card">
            <div className="p-4 border-b">
              <h2 className="font-semibold">Medicine Inventory</h2>
            </div>
            {invLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">Loading inventory...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b bg-muted/50">
                    <tr>
                      <th className="h-10 px-4 font-medium text-muted-foreground">Medicine Name</th>
                      <th className="h-10 px-4 font-medium text-muted-foreground text-center">Stock Level</th>
                      <th className="h-10 px-4 font-medium text-muted-foreground text-center">Reorder Threshold</th>
                      <th className="h-10 px-4 font-medium text-muted-foreground text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {inventory.map((item) => {
                      const isLow = item.stockQuantity <= (item.reorderLevel || 20);
                      return (
                        <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                          <td className="p-4 font-medium">{item.name}</td>
                          <td className="p-4 text-center font-semibold">{item.stockQuantity}</td>
                          <td className="p-4 text-center text-muted-foreground">{item.reorderLevel || 20}</td>
                          <td className="p-4 text-right">
                            {isLow ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive">
                                <AlertCircle className="w-3 h-3" /> Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                                <CheckCircle className="w-3 h-3" /> In Stock
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
