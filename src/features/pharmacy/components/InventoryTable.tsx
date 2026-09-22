"use client";

import React, { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const InventoryTable = ({ data, isLoading }: { data: any[], isLoading: boolean }) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredData = (data || []).filter(item => {
    if (statusFilter !== "all" && item.status.toLowerCase() !== statusFilter.replace("-", " ")) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const columns = [
    {
      accessorKey: "name",
      header: "Medicine",
      cell: ({ row }: any) => <span className="font-medium">{row.original.name}</span>
    },
    {
      accessorKey: "batch",
      header: "Batch",
      cell: ({ row }: any) => <span className="font-mono text-sm text-slate-500">{row.original.batch}</span>
    },
    {
      accessorKey: "qty",
      header: () => <div className="text-right">Qty</div>,
      cell: ({ row }: any) => <div className="text-right tabular-nums">{row.original.qty}</div>
    },
    {
      accessorKey: "price",
      header: () => <div className="text-right">Price</div>,
      cell: ({ row }: any) => <div className="text-right tabular-nums">₹{row.original.price}</div>
    },
    {
      accessorKey: "expiry",
      header: "Expiry",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status;
        const color = status === "In Stock" ? "text-emerald-700 bg-emerald-50" : 
                      status === "Low Stock" ? "text-amber-700 bg-amber-50" : 
                      "text-red-700 bg-red-50";
        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border border-transparent ${color}`}>
            {status}
          </span>
        );
      }
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex gap-4 flex-1">
          <Input 
            placeholder="Search medicines..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs" 
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Medicine
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
        isLoading={isLoading}
      />
    </div>
  );
};
