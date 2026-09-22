"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRetrying, setIsRetrying] = useState<string | null>(null);

  const mockData = [
    { id: '1', time: '2026-09-22 10:30', channel: 'SMS', recipient: '+91 9876543210', template: 'appointment_reminder', status: 'Sent' },
    { id: '2', time: '2026-09-22 10:35', channel: 'Email', recipient: 'john@example.com', template: 'invoice_generated', status: 'Sent' },
    { id: '3', time: '2026-09-22 10:40', channel: 'WhatsApp', recipient: '+91 9123456789', template: 'payment_link', status: 'Failed' },
  ];

  const filteredData = mockData.filter(item => {
    if (channelFilter !== "all" && item.channel.toLowerCase() !== channelFilter) return false;
    if (statusFilter !== "all" && item.status.toLowerCase() !== statusFilter) return false;
    return true;
  });

  const handleRetry = (id: string) => {
    setIsRetrying(id);
    setTimeout(() => {
      setIsRetrying(null);
      toast.success("Notification queued for retry");
    }, 1000);
  };

  const columns = [
    { accessorKey: "time", header: "Time" },
    { accessorKey: "channel", header: "Channel", cell: ({ row }: any) => <span className="font-medium">{row.original.channel}</span> },
    { accessorKey: "recipient", header: "Recipient" },
    { accessorKey: "template", header: "Template" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: any) => {
        const status = row.original.status;
        return <StatusBadge status={status} color={status === "Sent" ? "emerald" : "red"} />;
      }
    },
    {
      id: "actions",
      cell: ({ row }: any) => row.original.status === "Failed" ? (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleRetry(row.original.id)}
          disabled={isRetrying === row.original.id}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying === row.original.id ? "animate-spin" : ""}`} />
          Retry
        </Button>
      ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="View and manage system notifications sent to patients and staff" />

      <div className="flex gap-4">
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Channels</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white border rounded-xl p-4">
        <DataTable columns={columns} data={filteredData} />
      </div>
    </div>
  );
}
