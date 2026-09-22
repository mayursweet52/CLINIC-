'use client';
import React, { useEffect } from 'react';
import { useTodaySchedule } from '../hooks';
import { AppointmentRow } from './AppointmentRow';
import { TableSkeleton } from '@/components/shared/TableSkeleton';
import { ErrorState } from '@/components/shared/ErrorState';
import { EmptyState } from '@/components/shared/EmptyState';
import { useQueryClient } from '@tanstack/react-query';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useRealtime } from '@/components/layout/RealtimeProvider';

export function ScheduleTimeline() {
  const { data: schedule, isLoading, isError, refetch } = useTodaySchedule();
  const queryClient = useQueryClient();
  const { lastEvent } = useRealtime();

  useEffect(() => {
    if (lastEvent) {
      if (lastEvent.type === 'appointment.created' || lastEvent.type === 'patient.checked_in') {
        queryClient.invalidateQueries({ queryKey: ['doctor-schedule-today'] });
        queryClient.invalidateQueries({ queryKey: ['doctor-stats'] });
      }
    }
  }, [lastEvent, queryClient]);

  if (isLoading) return <TableSkeleton rows={5} />;
  if (isError) return <ErrorState error={new Error("Failed to load schedule")} reset={() => refetch()} />;
  if (!schedule || schedule.length === 0) return <EmptyState icon={CalendarIcon} title="No appointments today. Enjoy!" />;

  return (
    <div className="flex flex-col">
      {schedule.map((appointment: any) => (
        <AppointmentRow key={appointment.id} appointment={appointment} />
      ))}
    </div>
  );
}
