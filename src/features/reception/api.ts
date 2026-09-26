export async function getTodayAppointments() {
  const res = await fetch('/api/appointments?date=today');
  if (!res.ok) throw new Error('Failed to fetch appointments');
  return res.json();
}

export async function checkIn(id: string) {
  const res = await fetch(`/api/appointments`, { 
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status: 'ARRIVED' })
  });
  if (!res.ok) throw new Error('Failed to check in');
  return res.json();
}

export async function cancelAppointment(id: string) {
  const res = await fetch(`/api/appointments`, { 
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status: 'CANCELLED' })
  });
  if (!res.ok) throw new Error('Failed to cancel');
  return res.json();
}
