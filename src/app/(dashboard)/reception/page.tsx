'use client';
import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { ReceptionStatCards } from '@/features/reception/components/ReceptionStatCards';
import { QueueTable } from '@/features/reception/components/QueueTable';
import Link from 'next/link';

export default function ReceptionPage() {
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader 
        title="Reception Desk" 
        description={dateStr}
        action={
          <Link href="/book" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
            + New Appointment
          </Link>
        }
      />
      
      <ReceptionStatCards />
      
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Patient Queue</h2>
        <QueueTable />
      </div>
    </div>
  );
}
