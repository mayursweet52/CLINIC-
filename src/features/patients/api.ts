export async function listPatients() {
  const res = await fetch('/api/patients');
  if (!res.ok) throw new Error('Failed to fetch patients');
  return res.json();
}

export async function getPatient(id: string) {
  const res = await fetch(`/api/patients/${id}`);
  if (!res.ok) throw new Error('Failed to fetch patient');
  return res.json();
}

export async function createPatient(data: any) {
  const res = await fetch('/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create patient');
  return res.json();
}
