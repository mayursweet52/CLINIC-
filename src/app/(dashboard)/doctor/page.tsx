import React from 'react';
import { DoctorDashboard } from './DoctorDashboard';
import { cookies } from 'next/headers';

export default async function DoctorPage() {
  // In a real app, read from session
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value || 'dev-doctor-id';
  const userName = cookieStore.get('userName')?.value || 'Smith';
  
  const user = { id: userId, name: userName, role: 'DOCTOR' };

  return <DoctorDashboard user={user} />;
}
