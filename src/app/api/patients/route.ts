import { NextResponse } from 'next/server';

// In-memory "database" for patient records
const patients = [
  { id: 1, name: 'John Doe', age: 34, contact: '123-456-7890', history: 'None' },
  { id: 2, name: 'Jane Roe', age: 28, contact: '098-765-4321', history: 'Asthma' },
];

export async function GET() {
  return NextResponse.json(patients);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newPatient = {
      id: patients.length + 1,
      name: body.name || 'Unknown',
      age: body.age || 0,
      contact: body.contact || 'N/A',
      history: body.history || 'No prior history'
    };
    
    patients.push(newPatient);
    
    return NextResponse.json(
      { message: 'Patient registered successfully', patient: newPatient }, 
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
