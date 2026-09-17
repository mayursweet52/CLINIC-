import { NextResponse } from 'next/server';

export async function GET() {
  const staff = [
    { id: 1, name: 'Dr. Smith', role: 'Doctor', department: 'Cardiology' },
    { id: 2, name: 'Dr. Adams', role: 'Doctor', department: 'Pediatrics' },
    { id: 3, name: 'Alice', role: 'Receptionist' },
  ];
  return NextResponse.json(staff);
}

export async function POST(request: Request) {
  const body = await request.json();
  // Simulate login or staff creation
  return NextResponse.json({ message: 'Staff authenticated or created', staff: body }, { status: 200 });
}
