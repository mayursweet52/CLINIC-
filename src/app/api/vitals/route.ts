import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApptStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    let orgId = req.headers.get("x-org-id");
    if (!orgId) {
      const defaultOrg = await prisma.organization.findFirst();
      if (defaultOrg) orgId = defaultOrg.id;
    }
    
    const body = await req.json();

    if (!body.appointmentId || !body.patientId || !orgId) {
      return NextResponse.json(
        { error: "appointmentId, patientId, and orgId are required" },
        { status: 400 }
      );
    }

    const vitalsBP = (body.bpSystolic && body.bpDiastolic) ? `${body.bpSystolic}/${body.bpDiastolic}` : null;

    const newVisit = await prisma.patientVisit.upsert({
      where: {
        appointmentId: body.appointmentId,
      },
      update: {
        vitalsBP: vitalsBP,
        vitalsPulse: body.pulseBpm ? parseInt(body.pulseBpm, 10) : null,
        vitalsWeight: body.weightKg ? parseFloat(body.weightKg) : null,
        vitalsTemp: body.temperature ? parseFloat(body.temperature) : null,
        chiefComplaint: body.symptoms || null,
        notes: body.doctorNotes || null,
      },
      create: {
        organizationId: orgId,
        appointmentId: body.appointmentId,
        patientId: body.patientId,
        vitalsBP: vitalsBP,
        vitalsPulse: body.pulseBpm ? parseInt(body.pulseBpm, 10) : null,
        vitalsWeight: body.weightKg ? parseFloat(body.weightKg) : null,
        vitalsTemp: body.temperature ? parseFloat(body.temperature) : null,
        chiefComplaint: body.symptoms || null,
        notes: body.doctorNotes || null,
      },
    });

    await prisma.healthAppointment.update({
      where: { id: body.appointmentId },
      data: { status: ApptStatus.COMPLETED },
    });

    return NextResponse.json(newVisit, { status: 201 });
  } catch (error) {
    console.error("Error saving vitals:", error);
    return NextResponse.json({ error: "Failed to save consultation details" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get("appointmentId");
    const patientId = searchParams.get("patientId");

    if (appointmentId) {
      const visit = await prisma.patientVisit.findUnique({
        where: { appointmentId },
        include: {
          patient: true,
          appointment: true,
        },
      });
      return NextResponse.json(visit);
    }

    if (patientId) {
      const visitList = await prisma.patientVisit.findMany({
        where: { patientId },
        include: {
          appointment: true,
        },
        orderBy: { visitDate: "desc" },
      });
      return NextResponse.json(visitList);
    }

    const allVisits = await prisma.patientVisit.findMany({
      take: 50,
      orderBy: { visitDate: "desc" },
    });
    return NextResponse.json(allVisits);
  } catch (error) {
    console.error("Error fetching vitals:", error);
    return NextResponse.json({ error: "Failed to fetch vitals" }, { status: 500 });
  }
}

