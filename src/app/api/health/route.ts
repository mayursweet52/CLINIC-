import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientCode } = body;

    if (!patientCode) {
      return NextResponse.json({ error: 'Patient Code is required' }, { status: 400 });
    }

    const patient = await prisma.patient.findFirst({
      where: { patientCode },
      include: {
        appointments: {
          include: {
            doctor: true,
            vitals: true
          },
          orderBy: { appointmentDate: 'desc' }
        },
        labReports: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error fetching patient portal data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
