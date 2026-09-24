"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePendingPrescriptions, useInventory } from "@/features/pharmacy/hooks";
import { DispenseDialog } from "@/features/pharmacy/components/DispenseDialog";
import { Clock, CheckCircle, AlertTriangle, Boxes, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { useQueryClient } from "@tanstack/react-query";

export default function PharmacyPage() {
  const queryClient = useQueryClient();
  const { data: pending, isLoading: pendingLoading } = usePendingPrescriptions();
  const { data: inventory, isLoading: inventoryLoading } = useInventory();
  
  const [selectedRx, setSelectedRx] = useState<any>(null);
  const [searchInv, setSearchInv] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);

  const filteredInventory = (inventory || []).filter((item: any) => {
    if (showLowStock && item.status !== "Low Stock" && item.status !== "Out of Stock") return false;
    if (searchInv && !item.name.toLowerCase().includes(searchInv.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 h-full flex flex-col pb-12">
      <div className="flex justify-between items-center shrink-0">
        <PageHeader title="Pharmacy" description="Manage prescriptions and inventory" />
        <Button className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Add Medicine
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 shrink-0">
        <StatCard label="Pending Rx" value={pending?.length || 0} icon={Clock} color="tertiary" />
        <StatCard label="Dispensed Today" value="45" icon={CheckCircle} color="success" />
        <StatCard label="Low Stock" value="12" icon={AlertTriangle} color="error" />
        <StatCard label="Total SKUs" value={inventory?.length || 0} icon={Boxes} color="primary" />
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <Tabs defaultValue="pending" className="flex flex-col h-full space-y-4">
          <TabsList className="bg-surface-low p-1 w-full max-w-md grid grid-cols-3 shrink-0 rounded-xl">
            <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-surface-lowest data-[state=active]:shadow-sm data-[state=active]:text-primary-700">
              Pending Dispense
            </TabsTrigger>
            <TabsTrigger value="inventory" className="rounded-lg data-[state=active]:bg-surface-lowest data-[state=active]:shadow-sm data-[state=active]:text-primary-700">
              Inventory
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="rounded-lg data-[state=active]:bg-surface-lowest data-[state=active]:shadow-sm data-[state=active]:text-primary-700">
              Suppliers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="m-0 flex-1 min-h-0 bg-surface-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-auto">
              {pendingLoading ? (
                <TableSkeleton rows={5} />
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-on-surface-variant uppercase bg-surface-low border-b border-outline-variant/20 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 font-medium">Rx ID</th>
                      <th className="px-6 py-4 font-medium">Patient</th>
                      <th className="px-6 py-4 font-medium">Doctor</th>
                      <th className="px-6 py-4 font-medium">Date</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {pending?.map((rx: any) => (
                      <tr key={rx.id} className="hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-colors cursor-pointer" onClick={() => setSelectedRx(rx)}>
                        <td className="px-6 py-4 font-mono text-xs font-medium text-primary-600">{rx.id}</td>
                        <td className="px-6 py-4 font-medium text-on-surface">{rx.patientName}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{rx.doctorName}</td>
                        <td className="px-6 py-4 text-on-surface-variant">{rx.date}</td>
                        <td className="px-6 py-4"><StatusBadge status={rx.status} /></td>
                        <td className="px-6 py-4 text-right">
                          <Button size="sm" className="bg-primary-100 text-primary-700 hover:bg-primary-200" onClick={(e) => { e.stopPropagation(); setSelectedRx(rx); }}>
                            Dispense
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {(!pending || pending.length === 0) && (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">No pending prescriptions.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="m-0 flex-1 min-h-0 bg-surface-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-outline-variant/20 bg-surface-lowest flex gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
                <Input 
                  placeholder="Search medicines..." 
                  value={searchInv}
                  onChange={(e) => setSearchInv(e.target.value)}
                  className="pl-9 bg-surface-low border-outline-variant/30 text-on-surface focus-visible:ring-primary-500" 
                />
              </div>
              <Button 
                variant={showLowStock ? "default" : "outline"} 
                onClick={() => setShowLowStock(!showLowStock)}
                className={showLowStock ? "bg-warning text-warning-foreground hover:bg-warning/90" : ""}
              >
                <AlertTriangle className="mr-2 h-4 w-4" /> Low Stock
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              {inventoryLoading ? (
                <TableSkeleton rows={8} />
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-on-surface-variant uppercase bg-surface-low border-b border-outline-variant/20 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 font-medium">Medicine</th>
                      <th className="px-6 py-4 font-medium">Batch</th>
                      <th className="px-6 py-4 font-medium text-right">Qty</th>
                      <th className="px-6 py-4 font-medium text-right">Price</th>
                      <th className="px-6 py-4 font-medium">Expiry</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {filteredInventory.map((item: any, idx: number) => {
                      const isLow = item.status === "Low Stock"
                      const isOut = item.status === "Out of Stock"
                      const statusColor = isOut ? 'bg-error text-white' : isLow ? 'bg-amber-100 text-amber-800' : 'bg-medical-green/20 text-medical-green'
                      
                      return (
                        <tr key={idx} className="hover:bg-surface-low transition-colors">
                          <td className="px-6 py-4 font-medium text-on-surface">{item.name}</td>
                          <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">{item.batch}</td>
                          <td className={`px-6 py-4 text-right font-medium tabular-nums ${isLow || isOut ? 'text-error' : 'text-on-surface'}`}>{item.qty}</td>
                          <td className="px-6 py-4 text-right tabular-nums text-on-surface">₹{item.price}</td>
                          <td className="px-6 py-4 text-on-surface-variant">{item.expiry}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                    {filteredInventory.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">No inventory found.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </TabsContent>

          <TabsContent value="suppliers" className="m-0 flex-1 min-h-0 bg-surface-lowest rounded-xl shadow-sm border border-outline-variant/20 flex items-center justify-center">
            <div className="text-center text-on-surface-variant py-12">
              <Boxes className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Supplier management coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <DispenseDialog 
        open={!!selectedRx} 
        onOpenChange={(open: boolean) => !open && setSelectedRx(null)} 
        prescription={selectedRx}
        onSuccess={() => {
          setSelectedRx(null);
          queryClient.invalidateQueries({ queryKey: ["prescriptions", "pending"] });
          queryClient.invalidateQueries({ queryKey: ["inventory"] });
        }}
      />
    </div>
  );
}
