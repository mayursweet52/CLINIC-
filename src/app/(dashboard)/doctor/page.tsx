import React from 'react';
import { DoctorDashboard } from './DoctorDashboard';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

export default async function DoctorPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  let userId = 'dev-doctor-id';
  let userName = 'Doctor';
  
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-businessos-health-12345');
      const { payload } = await jwtVerify(token, secret);
      if (payload.userId) {
        userId = payload.userId as string;
        const dbUser = await prisma.user.findUnique({ where: { id: userId } });
        if (dbUser) userName = dbUser.name || 'Doctor';
      }
    } catch (e) {
      console.error('Invalid token in doctor page', e);
    }
  }

  const user = { id: userId, name: userName, role: 'DOCTOR' };

  return <DoctorDashboard user={user} />;
}
