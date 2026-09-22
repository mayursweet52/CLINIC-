'use client';
import React, { useState, useEffect } from 'react';
import { useTodayAppointments } from '../hooks';
import { ReceptionAppointment } from '../types';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CheckInDialog } from './CheckInDialog';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useCancel } from '../hooks';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { useRealtime } from '@/components/layout/RealtimeProvider';

export function QueueTable() {
  const { data: appointments = [], isLoading } = useTodayAppointments();
  const [checkInId, setCheckInId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const cancel = useCancel();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { lastEvent } = useRealtime();

  useEffect(() => {
    if (lastEvent && lastEvent.type === 'appointment.created') {
      queryClient.invalidateQueries({ queryKey: ['reception-appointments-today'] });
    }
  }, [lastEvent, queryClient]);

  const columns = [
    { 
      header: 'Token', 
      accessorKey: 'tokenNumber',
      cell: (info: any) => <span className="font-mono font-bold text-primary-600">#{info.getValue()}</span>
    },
    {
      header: 'Patient',
      accessorFn: (row: any) => row.patient?.name,
      cell: (info: any) => <span className="font-medium text-slate-800 dark:text-slate-200">{info.getValue()}</span>
    },
    {
      header: 'Doctor',
      accessorFn: (row: any) => row.doctor?.name || 'Unassigned',
    },
    { header: 'Time', accessorKey: 'timeSlot' },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info: any) => <StatusBadge status={info.getValue()} />
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: (info: any) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-2">
            {row.status === 'SCHEDULED' && (
              <button onClick={(e) => { e.stopPropagation(); setCheckInId(row.id); }} className="text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">
                Check In
              </button>
            )}
            {(row.status === 'SCHEDULED' || row.status === 'ARRIVED') && (
              <button onClick={(e) => { e.stopPropagation(); setCancelId(row.id); }} className="text-sm bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100">
                Cancel
              </button>
            )}
            <button onClick={(e) => { e.stopPropagation(); router.push(`/appointments/${row.id}`); }} className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-slate-100 underline">
              Details
            </button>
          </div>
        );
      }
    }
  ];

  const handleCancel = async () => {
    if (cancelId) {
      await cancel.mutateAsync(cancelId);
      setCancelId(null);
    }
  };

  return (
    <>
      <DataTable 
        columns={columns} 
        data={appointments} 
        loading={isLoading} 
      />
      {checkInId && <CheckInDialog appointmentId={checkInId} open={!!checkInId} onOpenChange={(o) => !o && setCheckInId(null)} />}
      <ConfirmDialog 
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment?"
        confirmText="Yes, Cancel"
        variant="danger"
        loading={cancel.isPending}
        onConfirm={handleCancel}
        open={!!cancelId}
        onOpenChange={(o) => !o && setCancelId(null)}
      />
    </>
  );
}
