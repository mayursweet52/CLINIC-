"use client";

import React from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePendingPrescriptions, useInventory } from "@/features/pharmacy/hooks";
import { PendingTable } from "@/features/pharmacy/components/PendingTable";
import { InventoryTable } from "@/features/pharmacy/components/InventoryTable";

export default function PharmacyPage() {
  const { data: pending, isLoading: pendingLoading } = usePendingPrescriptions();
  const { data: inventory, isLoading: inventoryLoading } = useInventory();

  return (
    <div className="space-y-6">
      <PageHeader title="Pharmacy" description="Manage prescriptions and inventory" />

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Dispense</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="m-0 space-y-4">
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <PendingTable data={pending || []} isLoading={pendingLoading} />
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="m-0 space-y-4">
          <div className="bg-white rounded-xl border p-4 shadow-sm">
            <InventoryTable data={inventory || []} isLoading={inventoryLoading} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
