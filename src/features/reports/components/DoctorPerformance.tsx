"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/shared/DataTable";
import { Star } from "lucide-react";

export const DoctorPerformance = ({ data, isLoading }: { data: any[], isLoading: boolean }) => {
  const columns = [
    {
      accessorKey: "name",
      header: "Doctor",
      cell: ({ row }: any) => <span className="font-medium">{row.original.name}</span>
    },
    {
      accessorKey: "appointments",
      header: () => <div className="text-right">Appointments</div>,
      cell: ({ row }: any) => <div className="text-right">{row.original.appointments}</div>
    },
    {
      accessorKey: "rating",
      header: () => <div className="text-right">Rating</div>,
      cell: ({ row }: any) => (
        <div className="flex items-center justify-end space-x-1">
          <span>{row.original.rating}</span>
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        </div>
      )
    },
    {
      accessorKey: "revenue",
      header: () => <div className="text-right">Revenue Generated</div>,
      cell: ({ row }: any) => (
        <div className="text-right font-mono tabular-nums">
          ₹{row.original.revenue.toLocaleString()}
        </div>
      )
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Doctor Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={data || []} isLoading={isLoading} />
      </CardContent>
    </Card>
  );
};
