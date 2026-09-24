import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

async function requireDoctor() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return { error: "Unauthorized", status: 401 };
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    ) as any;
    if (payload.role !== "DOCTOR") {
      return { error: "Forbidden", status: 403 };
    }
    return { user: payload };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
}

function calculateAge(dob: Date | null): number {
  if (!dob) return 0;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

export async function GET() {
  try {
    const auth = await requireDoctor();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { user } = auth;

    const appointments = await prisma.healthAppointment.findMany({
      where: {
        doctorId: user.userId,
        organizationId: user.orgId,
        status: "COMPLETED",
      },
      select: {
        patientId: true,
        appointmentDate: true,
      },
      orderBy: { appointmentDate: "desc" }
    });

    const patientIds = [...new Set(appointments.map(a => a.patientId))];

    if (patientIds.length === 0) {
      return NextResponse.json({ patients: [], count: 0 });
    }

    const patients = await prisma.patient.findMany({
      where: {
        id: { in: patientIds },
        organizationId: user.orgId,
      },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        patientCode: true,
        phone: true,
        dob: true,
        gender: true,
        bloodGroup: true,
        createdAt: true,
      },
    });

    const formatted = patients.map(p => {
      const pAppts = appointments.filter(a => a.patientId === p.id);
      const lastVisit = pAppts.length > 0 ? pAppts[0].appointmentDate : null;
      return {
        ...p,
        age: calculateAge(p.dob),
        lastVisit,
        totalVisits: pAppts.length,
      };
    });

    return NextResponse.json({
      patients: formatted,
      count: formatted.length,
    });
  } catch (error) {
    console.error("Doctor Patients API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
