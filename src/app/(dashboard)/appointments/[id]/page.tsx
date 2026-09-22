'use client';
import React from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import Link from 'next/link';
import { ArrowLeft, User, UserCheck, Calendar as CalendarIcon, Clock, Stethoscope, CheckCircle2 } from 'lucide-react';

export default function AppointmentDetailPage({ params }: { params: { id: string } }) {
  // Mock appointment data
  const appointment = {
    id: params.id,
    tokenNumber: 42,
    appointmentNo: 'AMC-2024-0147',
    status: 'ARRIVED',
    date: '2024-10-15',
    time: '10:30 AM',
    patient: { id: 'p1', name: 'Jane Doe', age: 32, phone: '+1 555-0198' },
    doctor: { id: 'd1', name: 'Dr. Smith', department: 'Cardiology' },
  };

  const timelineSteps = ['SCHEDULED', 'CONFIRMED', 'ARRIVED', 'IN_CONSULTATION', 'COMPLETED'];
  const currentIndex = timelineSteps.indexOf(appointment.status);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center text-sm text-slate-500 mb-4">
        <Link href="/doctor" className="hover:text-slate-800 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Appointments
        </Link>
        <span className="mx-2">/</span>
        <span className="font-mono text-slate-700">{appointment.appointmentNo}</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900">Token #{appointment.tokenNumber}</h1>
            <StatusBadge status={appointment.status} />
          </div>
          <p className="text-slate-500 mt-1">{appointment.date} at {appointment.time}</p>
        </div>
        <div className="flex gap-2">
          {appointment.status === 'SCHEDULED' && <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium text-sm">Check In</button>}
          {appointment.status === 'ARRIVED' && <button className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-medium text-sm">Start Consultation</button>}
          <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 font-medium text-sm">Reschedule</button>
          <button className="px-4 py-2 text-red-600 hover:bg-red-50 rounded font-medium text-sm">Cancel</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><User className="w-6 h-6" /></div>
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Patient</h3>
            <Link href={`/patients/${appointment.patient.id}`} className="text-lg font-bold text-slate-900 hover:text-blue-600 mt-1 block">
              {appointment.patient.name}
            </Link>
            <p className="text-slate-600">{appointment.patient.age} yrs • {appointment.patient.phone}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600"><Stethoscope className="w-6 h-6" /></div>
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Doctor</h3>
            <p className="text-lg font-bold text-slate-900 mt-1">{appointment.doctor.name}</p>
            <p className="text-slate-600">{appointment.doctor.department}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Appointment Status</h3>
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-100 -z-10"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-500 -z-10 transition-all duration-500" style={{ width: `${(Math.max(0, currentIndex) / (timelineSteps.length - 1)) * 100}%` }}></div>
          
          {timelineSteps.map((step, index) => {
            const isCompleted = index <= currentIndex;
            const isCurrent = index === currentIndex;
            return (
              <div key={step} className="flex flex-col items-center gap-2 bg-white px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-300 text-slate-300'} ${isCurrent ? 'ring-4 ring-emerald-100' : ''}`}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>}
                </div>
                <span className={`text-xs font-medium ${isCompleted ? 'text-emerald-700' : 'text-slate-400'}`}>{step.replace('_', ' ')}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
