import { api } from '@/lib/api-client';

export async function getTodaySchedule(doctorId?: string) {
  const url = doctorId ? `/appointments?date=today&doctorId=${doctorId}` : '/appointments?date=today';
  const data = await api.get<any[]>(url).catch(() => []);
  
  // Map backend format to AppointmentRow format
  return data.map(apt => ({
    id: apt.id,
    tokenNumber: apt.tokenNumber,
    timeSlot: apt.time || '10:00 AM',
    status: apt.rawStatus || 'SCHEDULED',
    patient: {
      id: apt.patientId || 'unknown',
      name: apt.patientName || 'Anonymous Patient',
      age: 30, // Mock age if not present
      gender: apt.patient?.gender || 'Not Specified',
      chiefComplaint: 'Consultation' // Mock chief complaint
    }
  })).sort((a, b) => a.tokenNumber - b.tokenNumber);
}

export async function getStats(doctorId?: string) {
  // Use today's schedule to calculate real-time stats
  const schedule = await getTodaySchedule(doctorId).catch(() => []);
  const total = schedule.length;
  const completed = schedule.filter(a => a.status === 'COMPLETED').length;
  const inQueue = schedule.filter(a => a.status === 'ARRIVED').length;
  
  return {
    total,
    completed,
    inQueue,
    avgTime: 12 // Arbitrary average time for demo
  };
}

export async function completeConsultation(id: string) {
  // Call the actual PUT endpoint
  return api.put(`/appointments`, { id, status: 'COMPLETED' });
}
