'use client';
import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SplitPane } from '@/components/shared/SplitPane';
import { InspectorPanel } from '@/components/shared/InspectorPanel';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTodaySchedule } from '@/features/doctor/hooks';
import { useRealtime } from '@/hooks/useRealtime';
import { Users, AlertCircle, Clock, DoorOpen, Search, ListOrdered, Calendar, User as UserIcon, CheckCircle2, AlertTriangle } from 'lucide-react';
import { format, differenceInYears } from 'date-fns';

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

// Inline VitalCard
function VitalCard({ label, value, unit, status }: { label: string; value: string; unit: string; status: 'normal' | 'warning' | 'critical' }) {
  return (
    <div className="p-3 rounded-lg bg-surface-low">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-on-surface-variant">{label}</span>
        {status === 'normal' && <CheckCircle2 className="h-3.5 w-3.5 text-medical-green" />}
        {status === 'warning' && <AlertTriangle className="h-3.5 w-3.5 text-tertiary-700" />}
        {status === 'critical' && <AlertCircle className="h-3.5 w-3.5 text-error" />}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-semibold text-on-surface">{value}</span>
        <span className="text-xs text-on-surface-variant">{unit}</span>
      </div>
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

export function DoctorDashboard({ user }: { user: any }) {
  const { data: schedule = [] } = useTodaySchedule(user?.id);
  
  // Keep real-time subscription alive for this dashboard context
  useRealtime({ doctorId: user?.id });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  // Derived state
  const userName = user?.name?.replace('Dr. ', '') || 'Doctor';
  const formattedDate = format(new Date(), 'EEEE, d MMMM');
  const totalAppointments = schedule.length;

  const activeQueueCount = schedule.filter(a => ['SCHEDULED', 'ARRIVED', 'IN_CONSULTATION'].includes(a.status)).length;
  const criticalCount = schedule.filter(a => a.status === 'IN_CONSULTATION').length;
  const avgWaitMin = 14; // Mocked for now
  const currentRoom = "Room 4";

  const filteredAppointments = schedule
    .filter(a => statusFilter === 'all' || a.status === statusFilter)
    .filter(a => !searchQuery || 
      a.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.tokenNumber && a.tokenNumber.toString().includes(searchQuery))
    );

  const getPriorityColor = (status: string) => {
    switch (status) {
      case 'IN_CONSULTATION': return 'bg-primary-500';
      case 'ARRIVED': return 'bg-tertiary-500';
      case 'SCHEDULED': return 'bg-secondary-500';
      default: return 'bg-outline-variant';
    }
  };

  const getInitials = (name: string) => name?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="space-y-6">
      <PageHeader 
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Doctor Console" }
        ]}
        title={`Good morning, Dr. ${userName}`}
        description={`${formattedDate} • ${totalAppointments} appointments today`}
        actions={
          <>
            <LiveBadge />
            <Button className="bg-primary-500 text-white hover:bg-primary-600">+ New Consultation</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Active Queue"
          value={activeQueueCount}
          icon={Users}
          color="primary"
        />
        <StatCard
          label="Critical Cases"
          value={criticalCount}
          icon={AlertCircle}
          color="error"
        />
        <StatCard
          label="Avg Wait Time"
          value={`${avgWaitMin} min`}
          icon={Clock}
          color="secondary"
        />
        <StatCard
          label="Consultation Room"
          value={currentRoom}
          icon={DoorOpen}
          color="success"
          hint="Active"
        />
      </div>

      <div className="bg-surface-lowest rounded-xl p-4 mb-6 shadow-sm border border-outline-variant/20 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Filter by name, ID or priority..."
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
                <ListOrdered className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-on-surface">Live Patient Queue</h2>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-700 animate-pulse" />
                Auto-syncing
              </span>
            </div>

            {filteredAppointments.length === 0 ? (
              <EmptyState 
                icon={Calendar}
                title="No appointments in queue"
                description="New bookings will appear here automatically"
              />
            ) : (
              <div className="divide-y divide-outline-variant/10">
                {filteredAppointments.map(apt => (
                  <div 
                    key={apt.id}
                    onClick={() => setSelectedAppointment(apt)}
                    className={`
                      p-4 flex items-center gap-4 cursor-pointer 
                      transition-colors relative
                      ${selectedAppointment?.id === apt.id 
                        ? 'bg-surface-high' 
                        : 'hover:bg-surface-low'}
                    `}
                  >
                    <div className={`
                      absolute left-0 top-0 bottom-0 w-1.5
                      ${getPriorityColor(apt.status)}
                    `} />

                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm shrink-0 ml-2">
                      {getInitials(apt.patient.name)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium text-sm text-on-surface truncate">
                            #{apt.tokenNumber} — {apt.patient.name}
                          </span>
                        </div>
                        <StatusBadge status={apt.status} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-on-surface-variant">
                        <span>
                          {apt.patient.gender} • {apt.patient.age}y
                        </span>
                        <span className="font-medium text-primary-600">
                          {apt.status === 'IN_CONSULTATION' 
                            ? `In Consultation (12m)` 
                            : `Wait: 14m`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        }
        inspector={
          selectedAppointment ? (
            <InspectorPanel
              title="Patient Quick-View"
              subtitle={selectedAppointment.patient.name}
              status={selectedAppointment.status}
              actions={
                <>
                  <Button variant="outline" size="sm" className="flex-1">
                    Reschedule
                  </Button>
                  <Button size="sm" className="flex-1 bg-primary-500 text-white hover:bg-primary-600">
                    Start Consultation
                  </Button>
                </>
              }
            >
              <div className="grid grid-cols-2 gap-3">
                <VitalCard
                  label="Blood Pressure"
                  value="128/82"
                  unit="mmHg"
                  status="normal"
                />
                <VitalCard
                  label="Heart Rate"
                  value="72"
                  unit="bpm"
                  status="normal"
                />
                <VitalCard
                  label="SpO2"
                  value="98"
                  unit="%"
                  status="normal"
                />
                <VitalCard
                  label="Temperature"
                  value="37.2"
                  unit="°C"
                  status="normal"
                />
              </div>

              <div className="space-y-2 pt-3 border-t border-outline-variant/20">
                <DetailRow label="Time Slot" value={selectedAppointment.timeSlot || '10:00 AM'} />
                <DetailRow label="Token" value={`#${selectedAppointment.tokenNumber}`} />
                <DetailRow label="Reason" value={selectedAppointment.patient.chiefComplaint || "General checkup"} />
              </div>

              <div className="pt-3 border-t border-outline-variant/20">
                <p className="text-xs font-medium text-on-surface-variant mb-1">
                  Chief Complaint
                </p>
                <p className="text-sm text-on-surface">
                  {selectedAppointment.patient.chiefComplaint || "No complaint recorded"}
                </p>
              </div>
            </InspectorPanel>
          ) : (
            <div className="bg-surface-lowest rounded-xl shadow-sm p-6 border border-outline-variant/20 flex flex-col items-center justify-center text-center min-h-[400px]">
              <div className="w-16 h-16 rounded-full bg-surface-low flex items-center justify-center mb-4">
                <UserIcon className="h-7 w-7 text-on-surface-variant" />
              </div>
              <p className="text-sm font-medium text-on-surface">
                Select a patient
              </p>
              <p className="text-xs text-on-surface-variant mt-1 max-w-[200px]">
                Click on any appointment in the queue to see details
              </p>
            </div>
          )
        }
      />
    </div>
  );
}
