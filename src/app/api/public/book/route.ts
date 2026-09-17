import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApptStatus } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orgId, doctorId, patientName, patientPhone, date, timeSlot } = body;

    if (!orgId || !doctorId || !patientName || !patientPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Find or create patient for this organization
    let patient = await prisma.patient.findFirst({
      where: { name: patientName, contactNumber: patientPhone, organizationId: orgId }
    });

    if (!patient) {
      const count = await prisma.patient.count({ where: { organizationId: orgId } });
      patient = await prisma.patient.create({
        data: {
          organizationId: orgId,
          patientCode: `PAT-${1000 + count + 1}`,
          name: patientName,
          contactNumber: patientPhone,
          age: 30, // Default for now
          gender: 'Not Specified'
        }
      });
    }

    // 2. Create the appointment
    const appointmentDate = date ? new Date(date) : new Date();
    const appointment = await prisma.appointment.create({
      data: {
        organizationId: orgId,
        patientId: patient.id,
        doctorId: doctorId,
        appointmentDate,
        timeSlot: timeSlot || '10:00 AM',
        status: ApptStatus.PENDING
      },
      include: {
        organization: true,
        doctor: true
      }
    });

    return NextResponse.json({
      message: 'Appointment booked successfully',
      tokenNumber: appointment.tokenNumber,
      patientCode: patient.patientCode,
      hospitalName: appointment.organization.name,
      doctorName: appointment.doctor?.name
    }, { status: 201 });

  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json({ error: 'Failed to book appointment' }, { status: 500 });
  }
}
