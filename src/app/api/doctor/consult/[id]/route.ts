import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

async function requireDoctor() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return { error: "Unauthorized", status: 401 };
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    if (payload.role !== "DOCTOR" && payload.role !== "SUPERADMIN" && payload.role !== "ADMIN") {
      return { error: "Forbidden", status: 403 };
    }
    return { user: payload };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireDoctor();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id: appointmentId } = await params;
    
    // Find appointment
    const appointment = await prisma.healthAppointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
      }
    });

    if (!appointment) return NextResponse.json({ error: "Appointment not found" }, { status: 404 });

    // Find or create Visit
    let visit = await prisma.patientVisit.findFirst({
      where: { appointmentId }
    });

    if (!visit) {
      visit = await prisma.patientVisit.create({
        data: {
          organizationId: appointment.organizationId,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId,
          appointmentId: appointment.id,
          visitDate: appointment.appointmentDate,
        }
      });
    }

    return NextResponse.json({ appointment, visit });
  } catch (error) {
    console.error("Consult GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireDoctor();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { id: appointmentId } = await params;
    const body = await req.json();

    const visit = await prisma.patientVisit.findFirst({
      where: { appointmentId }
    });

    if (!visit) return NextResponse.json({ error: "Visit not found" }, { status: 404 });

    const updated = await prisma.patientVisit.update({
      where: { id: visit.id },
      data: {
        vitalsBP: body.vitalsBP,
        vitalsPulse: body.vitalsPulse,
        vitalsTemp: body.vitalsTemp,
        vitalsWeight: body.vitalsWeight,
        chiefComplaint: body.chiefComplaint,
        diagnosis: body.diagnosis,
        notes: body.notes,
      }
    });

    return NextResponse.json({ visit: updated });
  } catch (error) {
    console.error("Consult PATCH Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
