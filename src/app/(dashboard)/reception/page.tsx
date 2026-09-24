'use client';
import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SplitPane } from '@/components/shared/SplitPane';
import { InspectorPanel } from '@/components/shared/InspectorPanel';
import { EmptyState } from '@/components/shared/EmptyState';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTodayAppointments, useCheckIn, useCancel } from '@/features/reception/hooks';
import { useRealtime } from '@/components/layout/RealtimeProvider';
import { useQueryClient } from '@tanstack/react-query';
import { Users, AlertCircle, Clock, Calendar, CheckCircle2, Search, User as UserIcon, MoreHorizontal, Plus } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';
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

// Inline DetailRow
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-medium text-on-surface">{value}</span>
    </div>
  );
}

export default function ReceptionPage() {
  const { data: appointments = [], isLoading } = useTodayAppointments();
  
  // Real-time updates
  const { lastEvent } = useRealtime();
  const queryClient = useQueryClient();
  const checkIn = useCheckIn();
  const cancel = useCancel();

  useEffect(() => {
    if (lastEvent && lastEvent.type === 'appointment.created') {
      queryClient.invalidateQueries({ queryKey: ['reception-appointments-today'] });
    }
  }, [lastEvent, queryClient]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const formattedDate = format(new Date(), 'EEEE, d MMMM');
  const totalToday = appointments.length;

  const inQueueCount = appointments.filter((a: any) => a.status === 'ARRIVED').length;
  const completedCount = appointments.filter((a: any) => a.status === 'COMPLETED').length;
  const avgWaitMin = 12; // Mocked

  const filteredAppointments = appointments
    .filter((a: any) => statusFilter === 'all' || a.status === statusFilter)
    .filter((a: any) => !searchQuery || 
      a.patient?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.tokenNumber && a.tokenNumber.toString().includes(searchQuery))
    );

  const getInitials = (name: string) => name?.slice(0, 2).toUpperCase() || 'U';

  const handleCheckIn = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    checkIn.mutate(id);
  };

  const handleCancel = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    cancel.mutate(id);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Front Desk" }
        ]}
        title="Reception Queue"
        description={`${formattedDate} • ${totalToday} appointments today`}
        actions={
          <>
            <LiveBadge />
            <Button asChild className="bg-primary-500 text-white hover:bg-primary-600">
              <Link href="/book">
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Today" value={totalToday} icon={Calendar} color="primary" />
        <StatCard label="In Queue" value={inQueueCount} icon={Users} color="tertiary" />
        <StatCard label="Completed" value={completedCount} icon={CheckCircle2} color="success" />
        <StatCard label="Avg Wait Time" value={`${avgWaitMin} min`} icon={Clock} color="secondary" />
      </div>

      <div className="bg-surface-lowest rounded-xl p-4 mb-6 shadow-sm border border-outline-variant/20 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search by name, phone or token..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-low text-sm text-on-surface focus:bg-surface-lowest focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all"
          />
        </div>
        <div className="flex gap-2 shrink-0">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-surface-low rounded-lg border-0">
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
                <h2 className="text-lg font-semibold text-on-surface">Live Queue</h2>
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
                  description="Try adjusting your filters or search query."
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
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {filteredAppointments.map((apt: any) => (
                      <tr 
                        key={apt.id} 
                        onClick={() => setSelectedAppointment(apt)}
                        className={`cursor-pointer transition-colors ${selectedAppointment?.id === apt.id ? 'bg-surface-high' : 'hover:bg-surface-low'}`}
                      >
                        <td className="px-4 py-3 font-mono font-bold text-primary-600">#{apt.tokenNumber}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-xs shrink-0">
                              {getInitials(apt.patient?.name)}
                            </div>
                            <div>
                              <p className="font-medium text-on-surface">{apt.patient?.name}</p>
                              <p className="text-xs text-on-surface-variant">{apt.patient?.id?.slice(0,8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-on-surface">{apt.doctor?.name || 'Unassigned'}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{apt.timeSlot || '10:00 AM'}</td>
                        <td className="px-4 py-3"><StatusBadge status={apt.status} /></td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4 text-on-surface-variant" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {apt.status === 'SCHEDULED' && (
                                <DropdownMenuItem onClick={(e) => handleCheckIn(e, apt.id)}>
                                  Check In
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem asChild>
                                <Link href={`/appointments/${apt.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              {(apt.status === 'SCHEDULED' || apt.status === 'ARRIVED') && (
                                <DropdownMenuItem onClick={(e) => handleCancel(e, apt.id)} className="text-error focus:text-error">
                                  Cancel Appointment
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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
              subtitle={selectedAppointment.patient?.name}
              status={selectedAppointment.status}
              actions={
                <>
                  <Button variant="outline" size="sm" className="flex-1">
                    Reschedule
                  </Button>
                  <Button size="sm" className="flex-1" variant={selectedAppointment.status === 'SCHEDULED' ? 'default' : 'outline'} onClick={(e) => {
                    if (selectedAppointment.status === 'SCHEDULED') {
                      handleCheckIn(e, selectedAppointment.id);
                    }
                  }}>
                    {selectedAppointment.status === 'SCHEDULED' ? 'Check In' : 'View Details'}
                  </Button>
                </>
              }
            >
              <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/20">
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-lg">
                  {getInitials(selectedAppointment.patient?.name)}
                </div>
                <div>
                  <p className="font-semibold text-sm text-on-surface">{selectedAppointment.patient?.name}</p>
                  <p className="text-xs text-on-surface-variant">
                    {selectedAppointment.patient?.id?.slice(0,8)} • {selectedAppointment.patient?.age || 30}y, {selectedAppointment.patient?.gender || 'M'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <DetailRow label="Time Slot" value={selectedAppointment.timeSlot || '10:00 AM'} />
                <DetailRow label="Token" value={`#${selectedAppointment.tokenNumber}`} />
                <DetailRow label="Doctor" value={selectedAppointment.doctor?.name || 'Unassigned'} />
                <DetailRow label="Department" value={selectedAppointment.department || 'General'} />
                <DetailRow label="Room" value="Room 4" />
              </div>

              <div className="pt-3 border-t border-outline-variant/20">
                <p className="text-xs font-medium text-on-surface-variant mb-1">
                  Reason for Visit
                </p>
                <p className="text-sm text-on-surface bg-surface-low p-2 rounded-lg">
                  {selectedAppointment.reason || selectedAppointment.patient?.chiefComplaint || "No reason provided"}
                </p>
              </div>

              <div className="pt-3 border-t border-outline-variant/20">
                <p className="text-xs font-medium text-on-surface-variant mb-2">
                  Recent Visits
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs bg-surface-low p-2 rounded-lg">
                    <span className="text-on-surface-variant">10 Aug</span>
                    <span className="text-on-surface font-medium">Follow-up checkup</span>
                  </div>
                </div>
              </div>
            </InspectorPanel>
          ) : (
            <div className="bg-surface-lowest rounded-xl shadow-sm p-6 border border-outline-variant/20 flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-surface-low flex items-center justify-center mb-4">
                <UserIcon className="h-7 w-7 text-on-surface-variant" />
              </div>
              <p className="text-sm font-medium text-on-surface">Select an appointment</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Click a row to view patient details
              </p>
            </div>
          )
        }
      />
    </div>
  );
}
