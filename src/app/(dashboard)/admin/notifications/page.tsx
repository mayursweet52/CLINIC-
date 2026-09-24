"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { SplitPane } from "@/components/shared/SplitPane";
import { InspectorPanel } from "@/components/shared/InspectorPanel";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, Send, AlertCircle, Smartphone, Mail, MessageSquare, BellRing } from "lucide-react";
import { toast } from "sonner";

export default function NotificationsPage() {
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isRetrying, setIsRetrying] = useState<string | null>(null);
  const [selectedNotif, setSelectedNotif] = useState<any | null>(null);

  const mockData = [
    { id: '1', time: '2026-09-22 10:30', channel: 'SMS', recipient: '+91 9876543210', template: 'appointment_reminder', status: 'Sent', message: 'Your appointment is confirmed for tomorrow at 10 AM.' },
    { id: '2', time: '2026-09-22 10:35', channel: 'Email', recipient: 'john@example.com', template: 'invoice_generated', status: 'Sent', message: 'Your invoice for recent visit is attached.' },
    { id: '3', time: '2026-09-22 10:40', channel: 'WhatsApp', recipient: '+91 9123456789', template: 'payment_link', status: 'Failed', message: 'Payment link for your teleconsultation: https://pay.link/abc', error: 'Invalid WhatsApp number' },
  ];

  const filteredData = mockData.filter(item => {
    if (channelFilter !== "all" && item.channel.toLowerCase() !== channelFilter) return false;
    if (statusFilter !== "all" && item.status.toLowerCase() !== statusFilter) return false;
    return true;
  });

  const handleRetry = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setIsRetrying(id);
    setTimeout(() => {
      setIsRetrying(null);
      toast.success("Notification queued for retry");
    }, 1000);
  };

  const renderMain = () => (
    <div className="bg-surface-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-outline-variant/20 flex gap-4 items-center bg-surface-lowest">
        <Select value={channelFilter} onValueChange={setChannelFilter}>
          <SelectTrigger className="w-[180px] bg-surface-low border-outline-variant/30 text-on-surface focus:ring-primary-500">
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
          <SelectTrigger className="w-[180px] bg-surface-low border-outline-variant/30 text-on-surface focus:ring-primary-500">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-on-surface-variant uppercase bg-surface-low border-b border-outline-variant/20 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-4 font-medium">Time</th>
              <th className="px-6 py-4 font-medium">Channel</th>
              <th className="px-6 py-4 font-medium">Recipient</th>
              <th className="px-6 py-4 font-medium">Template</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {filteredData.map((notif) => {
              const ChannelIcon = notif.channel === 'SMS' ? Smartphone : notif.channel === 'Email' ? Mail : MessageSquare;
              return (
                <tr 
                  key={notif.id}
                  onClick={() => setSelectedNotif(notif)}
                  className={`hover:bg-primary-50/50 dark:hover:bg-primary-900/10 cursor-pointer transition-colors ${selectedNotif?.id === notif.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                >
                  <td className="px-6 py-4 text-on-surface-variant whitespace-nowrap">{notif.time}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-on-surface font-medium">
                      <ChannelIcon className="w-4 h-4 text-primary-500" /> {notif.channel}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-on-surface">{notif.recipient}</td>
                  <td className="px-6 py-4 text-on-surface-variant">{notif.template}</td>
                  <td className="px-6 py-4"><StatusBadge status={notif.status} /></td>
                </tr>
              )
            })}
            {filteredData.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-on-surface-variant">No notifications found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderInspector = () => {
    if (!selectedNotif) return (
      <div className="bg-surface-lowest rounded-xl shadow-sm p-6 border border-outline-variant/20 flex flex-col items-center justify-center text-center h-64">
        <div className="w-12 h-12 bg-surface-low rounded-full flex items-center justify-center mb-4 text-on-surface-variant">
          <BellRing className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-medium text-on-surface">No Message Selected</h3>
        <p className="text-xs text-on-surface-variant mt-1">Select a notification to view content</p>
      </div>
    );

    return (
      <InspectorPanel
        title="Message Details"
        subtitle={selectedNotif.template}
        status={selectedNotif.status}
      >
        <div className="space-y-6">
          <div className="bg-surface-low rounded-xl p-4 border border-outline-variant/20 space-y-3">
            <div>
              <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider">Channel</p>
              <p className="font-medium text-on-surface flex items-center gap-2">
                {selectedNotif.channel === 'SMS' ? <Smartphone className="w-4 h-4 text-primary-500"/> : selectedNotif.channel === 'Email' ? <Mail className="w-4 h-4 text-primary-500"/> : <MessageSquare className="w-4 h-4 text-primary-500"/>}
                {selectedNotif.channel}
              </p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider">Recipient</p>
              <p className="font-mono text-sm text-on-surface">{selectedNotif.recipient}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-1 uppercase tracking-wider">Timestamp</p>
              <p className="text-sm text-on-surface">{selectedNotif.time}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-on-surface mb-2">Message Content</h4>
            <div className="bg-surface-highest text-on-surface p-4 rounded-xl text-sm border border-outline-variant/10 shadow-inner min-h-[100px]">
              {selectedNotif.message}
            </div>
          </div>

          {selectedNotif.status === 'Failed' && (
            <div className="bg-error/10 border border-error/20 p-4 rounded-xl text-error text-sm">
              <span className="font-semibold block mb-1">Error Details:</span>
              {selectedNotif.error}
            </div>
          )}

          {selectedNotif.status === 'Failed' && (
            <div className="pt-4 border-t border-outline-variant/20">
              <Button 
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-sm"
                onClick={(e) => handleRetry(e, selectedNotif.id)}
                disabled={isRetrying === selectedNotif.id}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRetrying === selectedNotif.id ? "animate-spin" : ""}`} />
                Retry Sending
              </Button>
            </div>
          )}
        </div>
      </InspectorPanel>
    );
  };

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col pb-6">
      <div className="shrink-0">
        <PageHeader title="Notifications" description="View and manage system notifications sent to patients and staff" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 shrink-0">
        <StatCard label="Total Sent" value="8,450" icon={Send} color="primary" />
        <StatCard label="Failed Delivery" value="12" icon={AlertCircle} color="error" />
        <StatCard label="SMS Quota" value="85%" icon={Smartphone} color="tertiary" />
        <StatCard label="Email Quota" value="45%" icon={Mail} color="secondary" />
      </div>

      <div className="flex-1 min-h-0">
        <SplitPane main={renderMain()} inspector={renderInspector()} mainCols={8} />
      </div>
    </div>
  );
}
