import { HealthAppointment } from '@prisma/client';

export async function getTodaySchedule() {
  const res = await fetch('/api/appointments/today');
  if (!res.ok) throw new Error('Failed to fetch schedule');
  return res.json();
}

export async function getStats() {
  const res = await fetch('/api/doctor/stats');
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function completeConsultation(id: string) {
  const res = await fetch(`/api/appointments/${id}/complete`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to complete');
  return res.json();
}
