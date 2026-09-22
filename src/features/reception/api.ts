export async function getTodayAppointments() {
  const res = await fetch('/api/appointments/today-all');
  if (!res.ok) throw new Error('Failed to fetch appointments');
  return res.json();
}

export async function checkIn(id: string) {
  const res = await fetch(`/api/appointments/${id}/check-in`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to check in');
  return res.json();
}

export async function cancelAppointment(id: string) {
  const res = await fetch(`/api/appointments/${id}/cancel`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to cancel');
  return res.json();
}
