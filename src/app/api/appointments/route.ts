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

export async function GET(request: Request) {
  try {
    const orgId = request.headers.get('x-org-id');
    if (!orgId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const appointments = await prisma.appointment.findMany({
      where: { organizationId: orgId },
      include: {
        patient: true,
        doctor: true,
        vitals: true,
        billing: true,
      },
      orderBy: {
        appointmentDate: 'desc',
      },
    });

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
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments from database' },
      { status: 500 }
    );
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
