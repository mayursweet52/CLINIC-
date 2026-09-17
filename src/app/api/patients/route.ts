import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const org = await prisma.organization.findFirst();
    const patients = await prisma.patient.findMany({
      where: { organizationId: org?.id },
      orderBy: { createdAt: 'desc' },
    });

    const mappedPatients = patients.map((p) => ({
      id: p.patientCode || p.id,
      patientId: p.id,
      name: p.name,
      age: p.age,
      contact: p.contactNumber,
      history: p.medicalHistory || 'No prior history recorded.',
    }));

    return NextResponse.json(mappedPatients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json(
      { error: 'Database error fetching patients' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const org = await prisma.organization.findFirst();
    const count = await prisma.patient.count({ where: { organizationId: org?.id } });
    const patientCode = `PAT-${1001 + count}`;

    const newPatient = await prisma.patient.create({
      data: {
        organizationId: org?.id as string,
        patientCode,
        name: body.name || 'Unknown Patient',
        age: Number(body.age) || 30,
        gender: body.gender || 'Other',
        contactNumber: body.contact || body.contactNumber || '000-000-0000',
        medicalHistory: body.history || body.medicalHistory || 'New patient.',
      },
    });

    return NextResponse.json(
      {
        message: 'Patient created successfully',
        patient: {
          id: newPatient.patientCode,
          name: newPatient.name,
          age: newPatient.age,
          contact: newPatient.contactNumber,
          history: newPatient.medicalHistory,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating patient:', error);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
