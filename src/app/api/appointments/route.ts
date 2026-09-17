import { NextResponse } from 'next/server';

// In-memory "database" for the backend microservice
const appointments = [
  { id: 1, patientName: 'John Doe', doctor: 'Dr. Smith', date: '2026-10-01', time: '10:00 AM', status: 'Confirmed' },
  { id: 2, patientName: 'Jane Roe', doctor: 'Dr. Adams', date: '2026-10-01', time: '11:00 AM', status: 'Pending' },
];

export async function GET() {
  return NextResponse.json(appointments);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newAppointment = {
      id: appointments.length + 1,
      patientName: body.patientName || 'Anonymous Patient',
      doctor: body.doctor || 'Unassigned',
      date: body.date || new Date().toISOString().split('T')[0],
      time: body.time || '12:00 PM',
      status: body.status || 'Pending'
    };
    
    appointments.push(newAppointment);
    
    return NextResponse.json(
      { message: 'Appointment booked successfully', appointment: newAppointment }, 
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const index = appointments.findIndex(a => a.id === body.id);
    
    if (index !== -1) {
      appointments[index].status = body.status;
      return NextResponse.json({ message: 'Status updated', appointment: appointments[index] });
    }
    return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

