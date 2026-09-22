import React from 'react';
import { DoctorAppointment } from '../types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useCompleteConsultation } from '../hooks';

export function AppointmentRow({ appointment }: { appointment: DoctorAppointment }) {
  const completeMutation = useCompleteConsultation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'border-blue-500';
      case 'ARRIVED': return 'border-amber-500';
      case 'IN_CONSULTATION': return 'border-emerald-500';
      case 'COMPLETED': return 'border-gray-300';
      default: return 'border-gray-200';
    }
  };

  return (
    <div className={`p-4 rounded-lg border border-l-4 ${getStatusColor(appointment.status)} hover:shadow-sm flex items-center justify-between mb-3 bg-white`}>
      <div className="w-1/4">
        <div className="text-sm text-slate-500 font-medium">{appointment.timeSlot}</div>
        <div className="flex items-center mt-1">
          <span className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(appointment.status).replace('border-', 'bg-')}`}></span>
          <span className="text-xs text-slate-400 font-mono">Token: {appointment.tokenNumber}</span>
        </div>
      </div>
      
      <div className="w-2/4 px-4">
        <div className="font-semibold text-slate-800">{appointment.patient.name}</div>
        <div className="text-sm text-slate-500 mt-0.5">
          {(appointment.patient as any).age || 30} yrs, {appointment.patient.gender} • Reason: {(appointment.patient as any).chiefComplaint || 'Consultation'}
        </div>
      </div>

      <div className="w-1/4 flex flex-col items-end justify-center gap-2">
        <StatusBadge status={appointment.status} />
        
        {appointment.status === 'SCHEDULED' && (
          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition">
            Start Consultation
          </button>
        )}
        {appointment.status === 'ARRIVED' && (
          <button className="px-3 py-1 text-sm bg-amber-500 text-white rounded hover:bg-amber-600 transition shadow-sm font-medium">
            Start Consultation
          </button>
        )}
        {appointment.status === 'IN_CONSULTATION' && (
          <button 
            className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
            onClick={() => completeMutation.mutate(appointment.id)}
            disabled={completeMutation.isPending}
          >
            {completeMutation.isPending ? 'Completing...' : 'Complete'}
          </button>
        )}
        {appointment.status === 'COMPLETED' && (
          <button className="px-3 py-1 text-sm text-slate-600 bg-slate-100 rounded hover:bg-slate-200 transition">
            View Details
          </button>
        )}
      </div>
    </div>
  );
}
