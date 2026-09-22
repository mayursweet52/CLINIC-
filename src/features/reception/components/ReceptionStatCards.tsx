import React from 'react';
import { useTodayAppointments } from '../hooks';
import { StatCard } from '@/components/shared/StatCard';
import { Calendar, CheckCircle, Clock, Users } from 'lucide-react';

export function ReceptionStatCards() {
  const { data: appointments = [], isLoading } = useTodayAppointments();

  const total = appointments.length;
  const inQueue = appointments.filter((a: any) => a.status === 'ARRIVED' || a.status === 'SCHEDULED').length;
  const completed = appointments.filter((a: any) => a.status === 'COMPLETED').length;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse"></div>)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <StatCard label="Today's Appointments" value={total} icon={Calendar} iconVariant="primary" />
      <StatCard label="In Queue" value={inQueue} icon={Users} iconVariant="warning" />
      <StatCard label="Completed" value={completed} icon={CheckCircle} iconVariant="success" />
      <StatCard label="Avg Wait Time" value="12 min" icon={Clock} iconVariant="info" />
    </div>
  );
}
