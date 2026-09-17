import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const orgId = request.headers.get('x-org-id');
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const patients = await prisma.patient.findMany({
      where: { organizationId: orgId },
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
    const orgId = request.headers.get('x-org-id');
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    
    // Auto-generate patient code (PAT-100X)
    const count = await prisma.patient.count({ where: { organizationId: orgId } });
    const patientCode = `PAT-${1000 + count + 1}`;
    
    const newPatient = await prisma.patient.create({
      data: {
        organizationId: orgId,
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
        id: newPatient.id,
        patientCode: newPatient.patientCode,
        patient: {
          id: newPatient.id,
          patientCode: newPatient.patientCode,
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
