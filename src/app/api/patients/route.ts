import logger from '@/lib/logger';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

async function getUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key-for-businessos-health-12345');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

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

    const user = await getUser();
    logAction({
      userId: (user?.userId as string) || 'system',
      orgId: (user?.orgId as string) || orgId,
      action: 'CREATE',
      resource: 'Patient',
      resourceId: newPatient.id,
      after: newPatient,
      req: request
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
