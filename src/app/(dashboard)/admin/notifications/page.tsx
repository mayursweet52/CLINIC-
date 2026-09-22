"use client";

import { useState, useEffect } from "react";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { RefreshCw, Activity } from "lucide-react";

export default function NotificationsAdminPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [channel, setChannel] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/notifications?channel=${channel}&status=${status}&page=${page}&limit=10`);
      const data = await res.json();
      setNotifications(data.data);
      setTotalPages(data.meta.totalPages);
    } catch (err) {
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [channel, status, page]);

  const handleRetry = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Retry failed");
      toast.success("Notification queued for retry");
      fetchNotifications();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Notifications" 
        description="View and manage system notifications."
        action={
          <Button onClick={fetchNotifications} variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Select value={channel} onValueChange={(val) => { setChannel(val); setPage(1); }}>
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

          <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SENT">Sent</SelectItem>
              <SelectItem value="FAILED">Failed</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton cols={5} rows={5} />
          ) : notifications.length === 0 ? (
            <EmptyState 
              title="No notifications found"
              description="Try adjusting your filters"
              icon={Activity}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-muted/50 text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium border-b">Time</th>
                    <th className="px-4 py-3 font-medium border-b">Channel</th>
                    <th className="px-4 py-3 font-medium border-b">Recipient</th>
                    <th className="px-4 py-3 font-medium border-b">Template</th>
                    <th className="px-4 py-3 font-medium border-b">Status</th>
                    <th className="px-4 py-3 font-medium border-b text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((n) => (
                    <tr key={n.id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(n.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-medium uppercase">{n.channel}</td>
                      <td className="px-4 py-3">{n.to}</td>
                      <td className="px-4 py-3 text-muted-foreground">{n.template}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={n.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        {n.status === "FAILED" && (
                          <Button size="sm" variant="outline" onClick={() => handleRetry(n.id)}>
                            Retry
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                  <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
