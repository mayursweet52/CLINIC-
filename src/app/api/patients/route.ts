import logger from '@/lib/logger';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const orgId = request.headers.get("x-org-id");
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const patients = await prisma.patient.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    });

    const mappedPatients = patients.map((p) => ({
      id: p.patientCode || p.id,
      patientId: p.id,
      name: p.name,
      dob: p.dob,
      contact: p.phone,
      history: p.chronicConds.join(", ") || "No prior history recorded.",
    }));

    return NextResponse.json(mappedPatients);
  } catch (error) {
    logger.error("Error fetching patients:", error);
    return NextResponse.json(
      { error: "Database error fetching patients" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const orgId = request.headers.get("x-org-id");
    if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    
    // Auto-generate patient code (PAT-100X)
    const count = await prisma.patient.count({ where: { organizationId: orgId } });
    const patientCode = `PAT-${1000 + count + 1}`;
    
    const newPatient = await prisma.patient.create({
      data: {
        organizationId: orgId,
        patientCode,
        name: body.name || "Unknown Patient",
        dob: body.dob ? new Date(body.dob) : new Date("1990-01-01"),
        gender: body.gender || "Other",
        phone: body.contact || body.phone || "000-000-0000",
        chronicConds: body.history ? [body.history] : [],
      },
    });

    return NextResponse.json(
      {
        message: "Patient created successfully",
        id: newPatient.id,
        patientCode: newPatient.patientCode,
        patient: {
          id: newPatient.id,
          patientCode: newPatient.patientCode,
          name: newPatient.name,
          dob: newPatient.dob,
          contact: newPatient.phone,
          history: newPatient.chronicConds.join(", "),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Error creating patient:", error);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}


