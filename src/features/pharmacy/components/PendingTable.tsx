"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Button } from "@/components/ui/button";
import { DispenseDialog } from "./DispenseDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";

export const PendingTable = ({ data, isLoading }: { data: any[], isLoading: boolean }) => {
  const [selectedRx, setSelectedRx] = useState<any>(null);

  const columns = [
    {
      accessorKey: "id",
      header: "Rx ID",
      cell: ({ row }: any) => <span className="font-mono text-primary-600 font-medium">{row.original.id}</span>
    },
    {
      accessorKey: "patientName",
      header: "Patient",
    },
    {
      accessorKey: "doctorName",
      header: "Doctor",
    },
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => <StatusBadge status={row.original.status} />
    },
    {
      id: "actions",
      cell: ({ row }: any) => (
        <Button 
          size="sm" 
          onClick={(e) => {
            e.stopPropagation();
            setSelectedRx(row.original);
          }}
        >
          Dispense
        </Button>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data || []}
        loading={isLoading}
        onRowClick={(row) => setSelectedRx(row)}
      />
      <DispenseDialog 
        open={!!selectedRx} 
        onOpenChange={(open: boolean) => !open && setSelectedRx(null)} 
        prescription={selectedRx} 
      />
    </>
  );
};
