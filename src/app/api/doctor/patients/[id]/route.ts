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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await requireDoctor();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { user } = auth;

    // CRITICAL: Verify doctor-patient relationship exists
    const relationship = await prisma.healthAppointment.findFirst({
      where: {
        doctorId: user.userId,
        patientId: id,
        organizationId: user.orgId,
        status: "COMPLETED",
      },
    });

    if (!relationship) {
      console.warn("Unauthorized patient access attempt", {
        doctorId: user.userId,
        patientId: id,
      });
      return NextResponse.json(
        { error: "Patient not under your care" },
        { status: 403 }
      );
    }

    const patient = await prisma.patient.findUnique({
      where: { id, organizationId: user.orgId },
      include: {
        appointments: {
          where: {
            doctorId: user.userId,
            organizationId: user.orgId,
          },
          orderBy: { appointmentDate: "desc" },
          take: 20,
          include: {
                        billing: {
              select: { id: true, totalAmount: true, paymentStatus: true }
            },
          },
        },
        prescriptions: {
          where: {
            doctorId: user.userId,
            organizationId: user.orgId,
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...patient,
      age: calculateAge(patient.dob),
    });
  } catch (error) {
    console.error("Doctor Patient Detail API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
