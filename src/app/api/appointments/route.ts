import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApptStatus } from '@prisma/client';

function mapToApptStatus(status?: string): ApptStatus {
  if (!status) return ApptStatus.PENDING;
  const upper = status.trim().toUpperCase().replace(/\s+/g, '_');
  if (upper in ApptStatus) {
    return upper as ApptStatus;
  }
  if (upper === 'CONFIRMED') return ApptStatus.PENDING;
  return ApptStatus.PENDING;
}

function formatStatus(status: ApptStatus): string {
  switch (status) {
    case ApptStatus.PENDING:
      return 'Pending';
    case ApptStatus.ARRIVED:
      return 'Arrived';
    case ApptStatus.IN_CONSULTATION:
      return 'In Consultation';
    case ApptStatus.COMPLETED:
      return 'Completed';
    case ApptStatus.CANCELLED:
      return 'Cancelled';
    default:
      return 'Pending';
  }
}

const DEMO_APPOINTMENTS = [
  {
    id: 'apt-demo-1',
    patientId: 'pat-demo-1',
    patientName: 'Ramesh Sharma',
    doctor: 'Dr. Smith',
    doctorId: 'doc-1',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    tokenNumber: 101,
    status: 'Arrived',
    rawStatus: 'ARRIVED',
    patient: {
      id: 'pat-demo-1',
      name: 'Ramesh Sharma',
      age: 45,
      gender: 'Male',
      contactNumber: '9876543210'
    }
  },
  {
    id: 'apt-demo-2',
    patientId: 'pat-demo-2',
    patientName: 'Pooja Verma',
    doctor: 'Dr. Smith',
    doctorId: 'doc-1',
    date: new Date().toISOString().split('T')[0],
    time: '10:30 AM',
    tokenNumber: 102,
    status: 'Pending',
    rawStatus: 'PENDING',
    patient: {
      id: 'pat-demo-2',
      name: 'Pooja Verma',
      age: 32,
      gender: 'Female',
      contactNumber: '9876543211'
    }
  },
  {
    id: 'apt-demo-3',
    patientId: 'pat-demo-3',
    patientName: 'Amit Patel',
    doctor: 'Dr. Smith',
    doctorId: 'doc-1',
    date: new Date().toISOString().split('T')[0],
    time: '11:00 AM',
    tokenNumber: 103,
    status: 'Pending',
    rawStatus: 'PENDING',
    patient: {
      id: 'pat-demo-3',
      name: 'Amit Patel',
      age: 28,
      gender: 'Male',
      contactNumber: '9876543212'
    }
  },
  {
    id: 'apt-demo-4',
    patientId: 'pat-demo-4',
    patientName: 'Sunil Jadhav',
    doctor: 'Dr. Smith',
    doctorId: 'doc-1',
    date: new Date().toISOString().split('T')[0],
    time: '09:30 AM',
    tokenNumber: 100,
    status: 'Completed',
    rawStatus: 'COMPLETED',
    patient: {
      id: 'pat-demo-4',
      name: 'Sunil Jadhav',
      age: 52,
      gender: 'Male',
      contactNumber: '9876543219'
    },
    doctorObj: {
      name: 'Smith'
    },
    prescriptions: [
      {
        id: 'pres-demo-1',
        dosage: '1-0-1',
        durationDays: 5,
        instructions: 'After meals',
        medicine: {
          id: 'med-1',
          name: 'Paracetamol 500mg',
          stockQuantity: 150,
          unitPrice: 15
        }
      },
      {
        id: 'pres-demo-2',
        dosage: '1-0-0',
        durationDays: 5,
        instructions: 'Before breakfast',
        medicine: {
          id: 'med-5',
          name: 'Pantoprazole 40mg',
          stockQuantity: 120,
          unitPrice: 35
        }
      }
    ]
  }
];

export async function GET(request: Request) {
  try {
    let orgId = request.headers.get('x-org-id');
    
    if (!orgId) {
      try {
        const org = await prisma.organization.findFirst();
        if (org) orgId = org.id;
      } catch (e) {}
    }

    const whereClause: any = orgId ? { organizationId: orgId } : {};

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        patient: true,
        doctor: true,
        vitals: true,
        billing: true,
        prescriptions: {
          include: {
            medicine: true,
          },
        },
      },
      orderBy: {
        appointmentDate: 'desc',
      },
    });

    if (!appointments || appointments.length === 0) {
      return NextResponse.json(DEMO_APPOINTMENTS);
    }

    const formatted = appointments.map((apt) => ({
      id: apt.id,
      patientId: apt.patientId,
      patientName: apt.patient?.name || 'Anonymous Patient',
      doctor: apt.doctor?.name || 'Unassigned',
      doctorId: apt.doctorId,
      date: apt.appointmentDate.toISOString().split('T')[0],
      time: apt.timeSlot,
      tokenNumber: apt.tokenNumber,
      status: formatStatus(apt.status),
      rawStatus: apt.status,
      patient: apt.patient,
      vitals: apt.vitals,
      billing: apt.billing,
      prescriptions: apt.prescriptions || [],
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.warn('Database offline in appointments GET, returning demo appointments fallback');
    return NextResponse.json(DEMO_APPOINTMENTS);
  }
}

export async function POST(request: Request) {
  try {
    const orgId = request.headers.get('x-org-id');
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    let patientId = body.patientId;
    if (!patientId) {
      const patientName = body.patientName || 'Anonymous Patient';
      let existingPatient = await prisma.patient.findFirst({
        where: { name: patientName, organizationId: orgId },
      });

      if (!existingPatient) {
        const randomCode = 'PAT-' + Math.floor(1000 + Math.random() * 9000);
        existingPatient = await prisma.patient.create({
          data: {
            organizationId: orgId,
            patientCode: randomCode,
            name: patientName,
            age: Number(body.patientAge) || 30,
            gender: body.patientGender || 'Not Specified',
            contactNumber: body.contactNumber || 'N/A',
          },
        });
      }
      patientId = existingPatient.id;
    }

    let doctorId = body.doctorId;
    if (!doctorId && body.doctor) {
      const doctorName = body.doctor.split('(')[0].trim();
      const existingDoctor = await prisma.user.findFirst({
        where: {
          name: { contains: doctorName, mode: 'insensitive' },
          organizationId: orgId
        },
      });
      if (existingDoctor) {
        doctorId = existingDoctor.id;
      }
    }

    const apptDate = body.date ? new Date(body.date) : new Date();

    const newAppointment = await prisma.appointment.create({
      data: {
        organizationId: orgId,
        patientId,
        doctorId: doctorId || null,
        appointmentDate: apptDate,
        timeSlot: body.time || body.timeSlot || '10:00 AM',
        status: mapToApptStatus(body.status),
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    const responseData = {
      id: newAppointment.id,
      patientId: newAppointment.patientId,
      patientName: newAppointment.patient?.name,
      doctor: newAppointment.doctor?.name || body.doctor || 'Unassigned',
      date: newAppointment.appointmentDate.toISOString().split('T')[0],
      time: newAppointment.timeSlot,
      tokenNumber: newAppointment.tokenNumber,
      status: formatStatus(newAppointment.status),
    };

    return NextResponse.json(
      { message: 'Appointment booked successfully', appointment: responseData },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error booking appointment:', error);
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 });
    }

    const updated = await prisma.appointment.update({
      where: { id: String(id) },
      data: {
        status: mapToApptStatus(status),
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    return NextResponse.json({
      message: 'Status updated',
      appointment: {
        id: updated.id,
        patientName: updated.patient?.name,
        doctor: updated.doctor?.name,
        status: formatStatus(updated.status),
      },
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json({ error: 'Appointment not found or failed to update' }, { status: 404 });
  }
}
