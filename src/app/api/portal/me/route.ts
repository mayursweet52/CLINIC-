import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('patient_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-businessos-health-12345');
    const { payload } = await jwtVerify(token, secret);
    
    const phone = payload.phone as string;
    const patientId = payload.userId as string;

    let patient = null;
    let appointments = [];
    let bills = [];
    
    try {
      patient = await prisma.patient.findFirst({ where: { phone } });
      if (patient) {
        appointments = await prisma.healthAppointment.findMany({
          where: { patientId: patient.id },
          include: { doctor: true },
          orderBy: { appointmentDate: 'desc' }
        });
        
        bills = await prisma.billing.findMany({
          where: { patientId: patient.id },
          orderBy: { createdAt: 'desc' }
        });
      }
    } catch {
      // Mock data if DB offline or doesn't have data
    }

    if (!patient) {
      patient = { id: patientId, name: 'Guest Patient', phone };
    }

    return NextResponse.json({
      patient,
      appointments: appointments.map(a => ({
        id: a.id,
        date: a.appointmentDate,
        time: a.timeSlot,
        doctor: a.doctor?.name || 'Unknown Doctor',
        status: a.status,
        token: a.tokenNumber
      })),
      bills: bills.map(b => ({
        id: b.id,
        amount: b.totalAmount,
        status: b.status,
        invoiceNo: b.invoiceNo,
        date: b.createdAt
      }))
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
