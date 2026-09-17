import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    // Map Prisma models to the UI expectations
    const mappedPatients = patients.map(p => ({
      id: p.patientCode,
      name: p.name,
      age: p.age,
      contact: p.contactNumber,
      history: p.medicalHistory || 'No prior history recorded.',
    }));
    
    return NextResponse.json(mappedPatients);
  } catch (error) {
    return NextResponse.json({ error: 'Database error fetching patients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const count = await prisma.patient.count();
    const patientCode = `PAT-${1001 + count}`;
    
    const newPatient = await prisma.patient.create({
      data: {
        patientCode,
        name: body.name || 'Unknown Patient',
        age: body.age || 30,
        gender: body.gender || 'Other',
        contactNumber: body.contact || '000-000-0000',
        medicalHistory: body.history || 'New patient.',
      }
    });
    
    return NextResponse.json(
      { message: 'Patient created successfully', patient: newPatient }, 
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
