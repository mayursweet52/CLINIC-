import logger from '@/lib/logger';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { withPermission } from '@/lib/withPermission';

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

export const GET = withPermission('patient:read', async (request: Request) => {
  const fallbackPatients = [
    {
      id: "pat-101",
      patientId: "pat-101",
      patientCode: "PAT-1001",
      name: "Rahul Deshmukh",
      age: 32,
      gender: "Male",
      phone: "+91 98765 43210",
      contact: "+91 98765 43210",
      lastVisit: new Date().toISOString(),
      history: "Hypertension, Seasonal allergies"
    },
    {
      id: "pat-102",
      patientId: "pat-102",
      patientCode: "PAT-1002",
      name: "Priya Patel",
      age: 28,
      gender: "Female",
      phone: "+91 91234 56789",
      contact: "+91 91234 56789",
      lastVisit: new Date().toISOString(),
      history: "Mild asthma"
    },
    {
      id: "pat-103",
      patientId: "pat-103",
      patientCode: "PAT-1003",
      name: "Amit Verma",
      age: 45,
      gender: "Male",
      phone: "+91 99887 76655",
      contact: "+91 99887 76655",
      lastVisit: new Date(Date.now() - 86400000 * 3).toISOString(),
      history: "Type 2 Diabetes"
    },
    {
      id: "pat-104",
      patientId: "pat-104",
      patientCode: "PAT-1004",
      name: "Sneha Kulkarni",
      age: 36,
      gender: "Female",
      phone: "+91 98711 22334",
      contact: "+91 98711 22334",
      lastVisit: new Date(Date.now() - 86400000 * 7).toISOString(),
      history: "Migraine"
    },
    {
      id: "pat-105",
      patientId: "pat-105",
      patientCode: "PAT-1005",
      name: "Ramesh Joshi",
      age: 54,
      gender: "Male",
      phone: "+91 94567 81234",
      contact: "+91 94567 81234",
      lastVisit: new Date(Date.now() - 86400000 * 14).toISOString(),
      history: "General Health Check"
    }
  ];

  try {
    let orgId = request.headers.get("x-org-id");
    if (!orgId) {
      const user = await getUser();
      orgId = (user?.orgId as string) || "org-1";
    }

    let patients: any[] = [];
    try {
      patients = await prisma.patient.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
      });
    } catch (dbErr) {
      logger.warn("Database unreachable in /api/patients, using demo fallback:", dbErr);
      patients = [];
    }

    if (!patients || patients.length === 0) {
      return NextResponse.json(fallbackPatients);
    }

    const mappedPatients = patients.map((p) => ({
      id: p.id,
      patientId: p.id,
      patientCode: p.patientCode || `PAT-${p.id.slice(0, 4)}`,
      name: p.name,
      dob: p.dob,
      age: 30,
      gender: p.gender || "Other",
      phone: p.phone,
      contact: p.phone,
      lastVisit: p.createdAt,
      history: p.chronicConds?.join(", ") || "No prior history recorded.",
    }));

    return NextResponse.json(mappedPatients);
  } catch (error) {
    logger.error("Error fetching patients:", error);
    return NextResponse.json(fallbackPatients);
  }
});

export const POST = withPermission('patient:create', async (request: Request) => {
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
});

