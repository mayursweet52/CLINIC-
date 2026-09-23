'use client';
import React, { useMemo } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DoctorStatCards } from '@/features/doctor/components/DoctorStatCards';
import { ScheduleTimeline } from '@/features/doctor/components/ScheduleTimeline';
import { useTodaySchedule } from '@/features/doctor/hooks';

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
  const { data: schedule } = useTodaySchedule(user?.id);
  const activeConsultation = useMemo(() => {
    return schedule?.find((a: any) => a.status === 'IN_CONSULTATION');
  }, [schedule]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 relative overflow-hidden">
      {activeConsultation && (
        <div className="relative bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-4">
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-purple-500 rounded-full blur-2xl opacity-50 pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="space-y-2">
              <span className="inline-block bg-white/20 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
                Active Consultation
              </span>
              <h2 className="text-2xl font-bold">{activeConsultation.patient?.name || 'Patient'}</h2>
              <p className="text-purple-100 text-sm">Token #{activeConsultation.tokenNumber} • {activeConsultation.timeSlot}</p>
            </div>
            <button className="px-6 py-2 bg-white text-purple-700 font-semibold rounded-lg hover:bg-purple-50 transition-colors shadow-sm">
              Complete
            </button>
          </div>
        </div>
      )}

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
