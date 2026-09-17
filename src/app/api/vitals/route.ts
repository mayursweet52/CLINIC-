import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ApptStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.appointmentId || !body.patientId) {
      return NextResponse.json(
        { error: 'appointmentId and patientId are required' },
        { status: 400 }
      );
    }

    // 1. Patient che Vitals database madhe save kara
    const newVitals = await prisma.vitals.upsert({
      where: {
        appointmentId: body.appointmentId,
      },
      update: {
        bpSystolic: body.bpSystolic ? parseInt(body.bpSystolic, 10) : null,
        bpDiastolic: body.bpDiastolic ? parseInt(body.bpDiastolic, 10) : null,
        pulseBpm: body.pulseBpm ? parseInt(body.pulseBpm, 10) : null,
        weightKg: body.weightKg ? parseFloat(body.weightKg) : null,
        temperature: body.temperature ? parseFloat(body.temperature) : null,
        symptoms: body.symptoms || null,
        doctorNotes: body.doctorNotes || null,
      },
      create: {
        appointmentId: body.appointmentId,
        patientId: body.patientId,
        bpSystolic: body.bpSystolic ? parseInt(body.bpSystolic, 10) : null,
        bpDiastolic: body.bpDiastolic ? parseInt(body.bpDiastolic, 10) : null,
        pulseBpm: body.pulseBpm ? parseInt(body.pulseBpm, 10) : null,
        weightKg: body.weightKg ? parseFloat(body.weightKg) : null,
        temperature: body.temperature ? parseFloat(body.temperature) : null,
        symptoms: body.symptoms || null,
        doctorNotes: body.doctorNotes || null,
      },
    });

    // 2. Patient cha status 'COMPLETED' kara (queue madhun kadhnyasaathi)
    await prisma.appointment.update({
      where: { id: body.appointmentId },
      data: { status: ApptStatus.COMPLETED },
    });

    return NextResponse.json(newVitals, { status: 201 });
  } catch (error) {
    console.error("Error saving vitals:", error);
    return NextResponse.json({ error: 'Failed to save consultation details' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get('appointmentId');
    const patientId = searchParams.get('patientId');

    if (appointmentId) {
      const vitals = await prisma.vitals.findUnique({
        where: { appointmentId },
        include: {
          patient: true,
          appointment: true,
        },
      });
      return NextResponse.json(vitals);
    }

    if (patientId) {
      const vitalsList = await prisma.vitals.findMany({
        where: { patientId },
        include: {
          appointment: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json(vitalsList);
    }

    const allVitals = await prisma.vitals.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(allVitals);
  } catch (error) {
    console.error("Error fetching vitals:", error);
    return NextResponse.json({ error: 'Failed to fetch vitals' }, { status: 500 });
  }
}
