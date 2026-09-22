import logger from '@/lib/logger';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApptStatus } from "@prisma/client";
import { publishEvent } from "@/lib/events";
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

function mapToApptStatus(status?: string): ApptStatus {
  if (!status) return ApptStatus.SCHEDULED;
  const upper = status.trim().toUpperCase().replace(/\s+/g, "_");
  if (upper in ApptStatus) {
    return upper as ApptStatus;
  }
  return ApptStatus.SCHEDULED;
}

function formatStatus(status: ApptStatus): string {
  switch (status) {
    case ApptStatus.SCHEDULED: return "Scheduled";
    case ApptStatus.PENDING: return "Pending";
    case ApptStatus.CONFIRMED: return "Confirmed";
    case ApptStatus.ARRIVED: return "Arrived";
    case ApptStatus.IN_CONSULTATION: return "In Consultation";
    case ApptStatus.COMPLETED: return "Completed";
    case ApptStatus.CANCELLED: return "Cancelled";
    default: return "Scheduled";
  }
}

export async function GET(request: Request) {
  try {
    let orgId = request.headers.get("x-org-id");
    
    // Fallback for development if orgId is not provided by the frontend
    if (!orgId) {
      const defaultOrg = await prisma.organization.findFirst();
      if (!defaultOrg) return NextResponse.json({ error: "No organizations found" }, { status: 404 });
      orgId = defaultOrg.id;
    }

    const appointments = await prisma.healthAppointment.findMany({
      where: { organizationId: orgId },
      include: {
        patient: true,
        doctor: true,
        visit: true,
        billing: true,
      },
      orderBy: {
        appointmentDate: "desc",
      },
    });

    const formatted = appointments.map((apt: any) => ({
      id: apt.id,
      patientId: apt.patientId,
      patientName: apt.patient?.name || "Anonymous Patient",
      doctor: apt.doctor?.name || "Unassigned",
      doctorId: apt.doctorId,
      date: apt.appointmentDate.toISOString().split("T")[0],
      time: apt.timeSlot,
      tokenNumber: apt.tokenNumber,
      status: formatStatus(apt.status),
      rawStatus: apt.status,
      patient: apt.patient,
      vitals: apt.visit,
      billing: apt.billing,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    logger.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments from database" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    let orgId = request.headers.get("x-org-id");
    
    // Fallback for development
    if (!orgId) {
      const defaultOrg = await prisma.organization.findFirst();
      if (!defaultOrg) return NextResponse.json({ error: "No organizations found" }, { status: 404 });
      orgId = defaultOrg.id;
    }

    const body = await request.json();

    let patientId = body.patientId;
    if (!patientId) {
      const patientName = body.patientName || "Anonymous Patient";
      let existingPatient = await prisma.patient.findFirst({
        where: { name: patientName, organizationId: orgId },
      });

      if (!existingPatient) {
        const count = await prisma.patient.count({ where: { organizationId: orgId } });
        const randomCode = "PAT-" + (1000 + count + 1);
        existingPatient = await prisma.patient.create({
          data: {
            organizationId: orgId,
            patientCode: randomCode,
            name: patientName,
            dob: new Date("1990-01-01"),
            gender: body.patientGender || "Not Specified",
            phone: body.contactNumber || "000-000-0000",
          },
        });
      }
      patientId = existingPatient.id;
    }

    let doctorId = body.doctorId;
    if (!doctorId && body.doctor) {
      const doctorName = body.doctor.split("(")[0].trim();
      const existingDoctor = await prisma.user.findFirst({
        where: {
          name: { contains: doctorName, mode: "insensitive" },
          organizationId: orgId
        },
      });
      if (existingDoctor) {
        doctorId = existingDoctor.id;
      }
    }

    const apptDate = body.date ? new Date(body.date) : new Date();

    const newAppointment = await prisma.healthAppointment.create({
      data: {
        organizationId: orgId,
        patientId,
        doctorId: doctorId || null,
        appointmentDate: apptDate,
        timeSlot: body.time || body.timeSlot || "10:00 AM",
        status: mapToApptStatus(body.status),
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    const user = await getUser();
    logAction({
      userId: (user?.userId as string) || 'system',
      orgId: (user?.orgId as string) || orgId,
      action: 'CREATE',
      resource: 'Appointment',
      resourceId: newAppointment.id,
      after: newAppointment,
      req: request
    });

    const responseData = {
      id: newAppointment.id,
      patientId: newAppointment.patientId,
      patientName: newAppointment.patient?.name,
      doctor: newAppointment.doctor?.name || body.doctor || "Unassigned",
      date: newAppointment.appointmentDate.toISOString().split("T")[0],
      time: newAppointment.timeSlot,
      tokenNumber: newAppointment.tokenNumber,
      status: formatStatus(newAppointment.status),
    };

    return NextResponse.json(
      { message: "Appointment booked successfully", appointment: responseData },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Error booking appointment:", error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id) {
      return NextResponse.json({ error: "Appointment ID required" }, { status: 400 });
    }

    const before = await prisma.healthAppointment.findUnique({ where: { id: String(id) } });

    const updated = await prisma.healthAppointment.update({
      where: { id: String(id) },
      data: {
        status: mapToApptStatus(status),
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    const user = await getUser();
    logAction({
      userId: (user?.userId as string) || 'system',
      orgId: (user?.orgId as string) || updated.organizationId,
      action: 'UPDATE',
      resource: 'Appointment',
      resourceId: updated.id,
      before,
      after: updated,
      req: request
    });

    return NextResponse.json({
      message: "Status updated",
      appointment: {
        id: updated.id,
        patientName: updated.patient?.name,
        doctor: updated.doctor?.name,
        status: formatStatus(updated.status),
      },
    });
  } catch (error) {
    logger.error("Error updating appointment:", error);
    return NextResponse.json({ error: "Appointment not found or failed to update" }, { status: 404 });
  }
}
