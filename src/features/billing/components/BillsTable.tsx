"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, CheckCircle, Download, Send } from "lucide-react";

export const BillsTable = ({ data, isLoading }: { data: any[], isLoading: boolean }) => {
  const router = useRouter();

  const columns = [
    {
      accessorKey: "id",
      header: "Invoice #",
      cell: ({ row }: any) => <span className="font-medium">{row.original.id}</span>
    },
    {
      accessorKey: "patientName",
      header: "Patient",
    },
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "amount",
      header: () => <div className="text-right">Amount</div>,
      cell: ({ row }: any) => (
        <div className="text-right font-mono tabular-nums">
          ₹{row.original.amount.toLocaleString()}
        </div>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status;
        const color = status === "Paid" ? "emerald" : status === "Partial" ? "amber" : "slate";
        return <StatusBadge status={status} />;
      }
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
        const invoiceId = row.original.id;
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/billing/${invoiceId}`)}>
                  <Eye className="mr-2 h-4 w-4" /> View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Mark Paid
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>
                  <Download className="mr-2 h-4 w-4" /> Download PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {}}>
                  <Send className="mr-2 h-4 w-4" /> Send Reminder
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data || []}
      loading={isLoading}
      onRowClick={(row) => router.push(`/billing/${row.id}`)}
    />
  );
};
