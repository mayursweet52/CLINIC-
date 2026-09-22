"use client";

import React from "react";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export const TimeOffList = ({ data, isLoading }: { data: any[], isLoading: boolean }) => {
  const columns = [
    {
      accessorKey: "dateRange",
      header: "Date Range",
      cell: ({ row }: any) => <span className="font-medium">{row.original.startDate} to {row.original.endDate}</span>
    },
    {
      accessorKey: "reason",
      header: "Reason",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status;
        const color = status === "Approved" ? "emerald" : "amber";
        return <StatusBadge status={status} />;
      }
    },
    {
      id: "actions",
      cell: () => (
        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
          <Trash2 className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return <DataTable columns={columns} data={data || []} loading={isLoading} />;
};
