'use client';
import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DoctorStatCards } from '@/features/doctor/components/DoctorStatCards';
import { ScheduleTimeline } from '@/features/doctor/components/ScheduleTimeline';

function LiveBadge() {
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      Live Sync
    </div>
  );
}

export function DoctorDashboard({ user }: { user: any }) {
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <PageHeader 
        title={`Good morning, Dr. ${user?.name?.split(' ')[0] || 'Doctor'}`} 
        description={dateStr}
        action={<LiveBadge />}
      />
      
      <DoctorStatCards doctorId={user?.id} />
      
      <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">Today's Schedule</h2>
        <ScheduleTimeline doctorId={user?.id} />
      </div>
    </div>
  );
}
