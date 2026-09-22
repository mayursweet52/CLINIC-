"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pill, Search, AlertCircle, Calendar, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { format } from "date-fns";

export default function PharmacyDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [invLoading, setInvLoading] = useState(true);
  
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [dispenseLoading, setDispenseLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

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
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    setInvLoading(true);
    try {
      const res = await fetch("/api/pharmacy").catch(() => null);
      if (res && res.ok) {
        setInventory(await res.json());
      } else {
        setInventory([
          { id: '1', name: 'Amoxicillin', batch: 'B1201', stockQuantity: 50, reorderLevel: 20, price: 120, expiry: '2026-12-01' },
          { id: '2', name: 'Paracetamol', batch: 'B1202', stockQuantity: 15, reorderLevel: 50, price: 40, expiry: '2027-01-15' },
          { id: '3', name: 'Ibuprofen', batch: 'B1203', stockQuantity: 0, reorderLevel: 10, price: 80, expiry: '2025-11-20' },
        ]);
      }
    } finally {
      setInvLoading(false);
    }
  };

  const handleDispenseClick = (appt: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedAppt(appt);
    setIsDialogOpen(true);
  };

  const handleDispenseAll = async () => {
    setDispenseLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setAppointments(prev => prev.filter(a => a.id !== selectedAppt.id));
      toast.success("Medicines Dispensed Successfully!");
      setIsDialogOpen(false);
    } catch (error) {
      toast.error("Failed to dispense medicines");
    } finally {
      setDispenseLoading(false);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedInventory = [...inventory]
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (!sortConfig) return 0;
      const { key, direction } = sortConfig;
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

  const getStockStatus = (qty: number, reorder: number) => {
    if (qty === 0) return { label: "Out of Stock", class: "bg-red-100 text-red-700" };
    if (qty <= reorder) return { label: "Low Stock", class: "bg-amber-100 text-amber-700" };
    return { label: "In Stock", class: "bg-emerald-100 text-emerald-700" };
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Pharmacy" />

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="queue">Pending Dispense</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="queue">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Rx ID</th>
                    <th className="px-6 py-4 font-semibold">Patient</th>
                    <th className="px-6 py-4 font-semibold">Doctor</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-0">
                        <TableSkeleton rows={4} cols={6} />
                      </td>
                    </tr>
                  ) : appointments.length > 0 ? (
                    appointments.map((appt) => (
                      <tr 
                        key={appt.id} 
                        className="hover:bg-slate-50 transition-all cursor-pointer"
                        onClick={() => handleDispenseClick(appt)}
                      >
                        <td className="px-6 py-4">
                          <span className="font-mono font-bold text-primary-600">
                            {appt.id.substring(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {appt.patientName || appt.patient?.name}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          Dr. {appt.doctor || appt.doctor?.name || "Smith"}
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {format(new Date(appt.date || Date.now()), "dd MMM yyyy")}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status="PENDING" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            size="sm" 
                            className="bg-primary-600 hover:bg-primary-700 text-white"
                            onClick={(e) => handleDispenseClick(appt, e)}
                          >
                            Dispense
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8">
                        <EmptyState 
                          icon={Pill} 
                          title="No pending prescriptions" 
                          description="All prescriptions have been dispensed" 
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inventory">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-white">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search medicines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => handleSort('name')}>
                      <div className="flex items-center gap-1">Medicine <ArrowUpDown className="h-3 w-3" /></div>
                    </th>
                    <th className="px-6 py-4 font-semibold">Batch</th>
                    <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => handleSort('stockQuantity')}>
                      <div className="flex items-center gap-1">Qty <ArrowUpDown className="h-3 w-3" /></div>
                    </th>
                    <th className="px-6 py-4 font-semibold cursor-pointer hover:bg-slate-100" onClick={() => handleSort('price')}>
                      <div className="flex items-center gap-1">Price <ArrowUpDown className="h-3 w-3" /></div>
                    </th>
                    <th className="px-6 py-4 font-semibold">Expiry</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {invLoading ? (
                    <tr>
                      <td colSpan={6} className="p-0">
                        <TableSkeleton rows={4} cols={6} />
                      </td>
                    </tr>
                  ) : sortedInventory.length > 0 ? (
                    sortedInventory.map((item) => {
                      const status = getStockStatus(item.stockQuantity, item.reorderLevel || 20);
                      const isLowStock = item.stockQuantity <= (item.reorderLevel || 20) && item.stockQuantity > 0;
                      
                      return (
                        <tr 
                          key={item.id} 
                          className={`hover:bg-slate-50 transition-colors ${isLowStock ? 'bg-amber-50/30' : ''}`}
                        >
                          <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                          <td className="px-6 py-4 text-slate-600">{item.batch || "N/A"}</td>
                          <td className="px-6 py-4 font-semibold text-slate-700">{item.stockQuantity}</td>
                          <td className="px-6 py-4 text-slate-600">₹{item.price || 0}</td>
                          <td className="px-6 py-4 text-slate-600">{item.expiry ? format(new Date(item.expiry), "MMM yyyy") : "N/A"}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status.class}`}>
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8">
                        <EmptyState 
                          icon={AlertCircle} 
                          title="Inventory empty" 
                          description="No items match your search criteria" 
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Dispense Prescription</DialogTitle>
            <DialogDescription>
              Review the medicines for {selectedAppt?.patientName || selectedAppt?.patient?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedAppt && (
            <div className="mt-4 space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-semibold mb-1">Doctor</span>
                    <span className="font-medium">Dr. {selectedAppt.doctor || selectedAppt.doctor?.name || "Smith"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs uppercase font-semibold mb-1">Date</span>
                    <span className="font-medium">{format(new Date(selectedAppt.date || Date.now()), "dd MMM yyyy")}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3">Prescribed Medicines</h4>
                <div className="space-y-3">
                  {selectedAppt.prescriptions?.map((p: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-3 border border-slate-200 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{p.medicineName || p.medicine?.name || "Medicine"}</p>
                        <p className="text-xs text-slate-500 mt-1">{p.dosage} • {p.durationDays} days</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary-600">Qty: {parseInt(p.dosage || '1') * parseInt(p.durationDays || '1')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button 
              className="bg-primary-600 hover:bg-primary-700 text-white" 
              onClick={handleDispenseAll} 
              disabled={dispenseLoading}
            >
              {dispenseLoading ? "Processing..." : "Dispense All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
