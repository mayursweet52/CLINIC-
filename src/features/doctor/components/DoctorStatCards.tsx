import React from 'react';
import { useDoctorStats } from '../hooks';
import { StatCard } from '@/components/shared/StatCard';
import { Calendar, CheckCircle, Clock, Users } from 'lucide-react';

export function DoctorStatCards() {
  const { data: stats, isLoading } = useDoctorStats();

  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse"></div>)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <StatCard label="Today's Appointments" value={stats.total || 0} icon={Calendar} iconVariant="primary" />
      <StatCard label="Completed" value={stats.completed || 0} icon={CheckCircle} iconVariant="success" />
      <StatCard label="In Queue" value={stats.inQueue || 0} icon={Users} iconVariant="warning" />
      <StatCard label="Avg Time" value={(stats.avgTime || 0) + ' min'} icon={Clock} iconVariant="info" />
    </div>
  );
}
