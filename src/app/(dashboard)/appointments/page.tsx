'use client';
import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SplitPane } from '@/components/shared/SplitPane';
import { InspectorPanel } from '@/components/shared/InspectorPanel';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, CheckCircle2, Clock, Search, MoreHorizontal, Plus, ClipboardList, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

function LiveBadge() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-medical-green/10 text-medical-green rounded-full text-sm font-medium border border-medical-green/20">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-medical-green opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-medical-green"></span>
      </span>
      Live Sync
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-medium text-on-surface">{value}</span>
    </div>
  );
}

export default function AppointmentsPage() {
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['all-appointments'],
    queryFn: async () => {
      const res = await fetch('/api/appointments');
      if (!res.ok) return [];
      return res.json();
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const formattedDate = format(new Date(), 'EEEE, d MMMM');
  const totalToday = appointments.length;

  const inQueueCount = appointments.filter((a: any) => ['ARRIVED', 'IN_CONSULTATION'].includes(a.rawStatus || a.status?.toUpperCase())).length;
  const completedCount = appointments.filter((a: any) => (a.rawStatus || a.status?.toUpperCase()) === 'COMPLETED').length;
  const avgWaitMin = 14;

  const filteredAppointments = appointments
    .filter((a: any) => {
      if (statusFilter === 'all') return true;
      const st = (a.rawStatus || a.status || '').toUpperCase();
      return st === statusFilter;
    })
    .filter((a: any) => !searchQuery || 
      a.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.doctor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.tokenNumber && a.tokenNumber.toString().includes(searchQuery))
    );

  const getInitials = (name: string) => name?.slice(0, 2).toUpperCase() || 'PT';

  return (
    <div className="space-y-6">
      <PageHeader 
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Appointments" }
        ]}
        title="Appointments Management"
        description={`${formattedDate} • ${totalToday} appointments scheduled`}
        actions={
          <>
            <LiveBadge />
            <Button asChild className="bg-primary-500 text-white hover:bg-primary-600">
              <Link href="/book">
                <Plus className="h-4 w-4 mr-2" />
                Book New Appointment
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Bookings" value={totalToday} icon={Calendar} color="primary" />
        <StatCard label="In Queue" value={inQueueCount} icon={Users} color="tertiary" />
        <StatCard label="Completed" value={completedCount} icon={CheckCircle2} color="success" />
        <StatCard label="Avg Wait Time" value={`${avgWaitMin} min`} icon={Clock} color="secondary" />
      </div>

      <div className="bg-surface-lowest rounded-xl p-4 mb-6 shadow-sm border border-outline-variant/20 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search by patient, doctor or token..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-low text-sm text-on-surface focus:bg-surface-lowest focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44 bg-surface-low rounded-lg border-0">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="ARRIVED">Arrived</SelectItem>
              <SelectItem value="IN_CONSULTATION">In Consultation</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <SplitPane
        mainCols={8}
        main={
          <div className="bg-surface-lowest rounded-xl shadow-sm overflow-hidden border border-outline-variant/20">
            <div className="p-4 flex items-center justify-between border-b border-outline-variant/20 bg-surface-lowest sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-on-surface">Scheduled Appointments</h2>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-700 animate-pulse" />
                Auto-syncing
              </span>
            </div>

            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="p-4"><TableSkeleton rows={5} cols={5} /></div>
              ) : filteredAppointments.length === 0 ? (
                <EmptyState 
                  icon={Calendar}
                  title="No appointments found"
                  description="New appointments booked will appear here."
                />
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-surface-low text-xs text-on-surface-variant uppercase border-b border-outline-variant/20">
                    <tr>
                      <th className="px-4 py-3 font-medium">Token</th>
                      <th className="px-4 py-3 font-medium">Patient</th>
                      <th className="px-4 py-3 font-medium">Doctor</th>
                      <th className="px-4 py-3 font-medium">Time</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {filteredAppointments.map((apt: any) => (
                      <tr 
                        key={apt.id} 
                        onClick={() => setSelectedAppointment(apt)}
                        className={`cursor-pointer transition-colors ${selectedAppointment?.id === apt.id ? 'bg-surface-high' : 'hover:bg-surface-low'}`}
                      >
                        <td className="px-4 py-3 font-mono font-bold text-primary-600">#{apt.tokenNumber || 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-xs shrink-0">
                              {getInitials(apt.patientName)}
                            </div>
                            <div>
                              <p className="font-medium text-on-surface">{apt.patientName}</p>
                              <p className="text-xs text-on-surface-variant">{apt.patient?.phone || 'No phone'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-on-surface font-medium">{apt.doctor || 'Dr. Ananya Sharma'}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{apt.time || '10:00 AM'}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={(apt.rawStatus || apt.status || 'SCHEDULED').toUpperCase()} />
                        </td>
                        <td className="px-4 py-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-primary-600 hover:text-primary-700 text-xs font-semibold"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAppointment(apt);
                            }}
                          >
                            Details →
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-4 border-t border-outline-variant/20 text-xs text-on-surface-variant text-center">
              Showing {filteredAppointments.length} appointments
            </div>
          </div>
        }
        inspector={
          selectedAppointment ? (
            <InspectorPanel
              title="Appointment Details"
              subtitle={selectedAppointment.patientName}
              status={selectedAppointment.status}
              actions={
                <>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/appointments/${selectedAppointment.id}`}>
                      Full Record
                    </Link>
                  </Button>
                  <Button size="sm" className="flex-1 bg-primary-500 text-white hover:bg-primary-600">
                    Check In
                  </Button>
                </>
              }
            >
              <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/20">
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-lg">
                  {getInitials(selectedAppointment.patientName)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-on-surface">{selectedAppointment.patientName}</p>
                  <p className="text-xs text-on-surface-variant">
                    {selectedAppointment.patient?.gender || 'Male'} • {selectedAppointment.patient?.age || 32}y
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <DetailRow label="Time Slot" value={selectedAppointment.time || '10:00 AM'} />
                <DetailRow label="Token" value={`#${selectedAppointment.tokenNumber || 1}`} />
                <DetailRow label="Doctor" value={selectedAppointment.doctor || 'Dr. Ananya Sharma'} />
                <DetailRow label="Date" value={selectedAppointment.date || new Date().toISOString().split('T')[0]} />
                <DetailRow label="Payment Status" value={selectedAppointment.billing?.paymentStatus || 'PAID'} />
              </div>

              <div className="pt-3 border-t border-outline-variant/20">
                <p className="text-xs font-medium text-on-surface-variant mb-1">
                  Contact
                </p>
                <p className="text-sm text-on-surface bg-surface-low p-2 rounded-lg font-mono">
                  {selectedAppointment.patient?.phone || '+91 98765 43210'}
                </p>
              </div>
            </InspectorPanel>
          ) : (
            <div className="bg-surface-lowest rounded-xl shadow-sm p-6 border border-outline-variant/20 flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-surface-low flex items-center justify-center mb-4">
                <UserIcon className="h-7 w-7 text-on-surface-variant" />
              </div>
              <p className="text-sm font-medium text-on-surface">Select an appointment</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Click any row in the list to view appointment details
              </p>
            </div>
          )
        }
      />
    </div>
  );
}
