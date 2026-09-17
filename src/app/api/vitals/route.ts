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

    // 1. Patient che Vitals save kivha update kara
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

    // 2. Prescriptions (Aushadhe) save kara
    if (body.prescriptions && Array.isArray(body.prescriptions) && body.prescriptions.length > 0) {
      // Clear existing prescriptions for this appointment to avoid duplicates
      await prisma.prescription.deleteMany({
        where: { appointmentId: body.appointmentId },
      });

      const presData = body.prescriptions.map((p: any) => ({
        appointmentId: body.appointmentId,
        medicineId: p.medicineId,
        dosage: p.dosage || '1-0-1',
        durationDays: parseInt(p.durationDays, 10) || 1,
        instructions: p.instructions || '',
      }));
      
      await prisma.prescription.createMany({
        data: presData
      });
    }

    // 3. Patient cha status 'COMPLETED' kara (queue madhun kadhnyasaathi)
    await prisma.appointment.update({
      where: { id: body.appointmentId },
      data: { status: ApptStatus.COMPLETED },
    });

    return NextResponse.json({ success: true, vitals: newVitals }, { status: 201 });
  } catch (error) {
    console.error("Error saving consultation:", error);
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
          appointment: {
            include: {
              prescriptions: {
                include: {
                  medicine: true,
                },
              },
            },
          },
        },
      });
      return NextResponse.json(vitals);
    }

    if (patientId) {
      const vitalsList = await prisma.vitals.findMany({
        where: { patientId },
        include: {
          appointment: {
            include: {
              prescriptions: {
                include: {
                  medicine: true,
                },
              },
            },
          },
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
