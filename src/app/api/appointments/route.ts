import logger from '@/lib/logger';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApptStatus } from "@prisma/client";
import { publishEvent } from "@/lib/events";
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

export const GET = withPermission('appointment:read', async (request: Request) => {
  const fallbackAppointments = [
    {
      id: "apt-1",
      patientId: "pat-101",
      patientName: "Rahul Deshmukh",
      doctor: "Dr. Ananya Sharma",
      doctorId: "doc-101",
      date: new Date().toISOString().split("T")[0],
      time: "10:00 AM",
      tokenNumber: 1,
      status: "Arrived",
      rawStatus: "ARRIVED",
      patient: { id: "pat-101", name: "Rahul Deshmukh", gender: "Male", age: 32, phone: "+91 98765 43210" },
      vitals: { vitalsBP: "120/80", vitalsPulse: 74, vitalsTemp: 98.6 },
      billing: { totalAmount: 500, paymentStatus: "PAID" }
    },
    {
      id: "apt-2",
      patientId: "pat-102",
      patientName: "Priya Patel",
      doctor: "Dr. Rajesh Patel",
      doctorId: "doc-102",
      date: new Date().toISOString().split("T")[0],
      time: "10:30 AM",
      tokenNumber: 2,
      status: "In Consultation",
      rawStatus: "IN_CONSULTATION",
      patient: { id: "pat-102", name: "Priya Patel", gender: "Female", age: 28, phone: "+91 91234 56789" },
      vitals: { vitalsBP: "115/78", vitalsPulse: 72, vitalsTemp: 98.4 },
      billing: { totalAmount: 800, paymentStatus: "PAID" }
    },
    {
      id: "apt-3",
      patientId: "pat-103",
      patientName: "Amit Verma",
      doctor: "Dr. Vikram Singh",
      doctorId: "doc-104",
      date: new Date().toISOString().split("T")[0],
      time: "11:00 AM",
      tokenNumber: 3,
      status: "Scheduled",
      rawStatus: "SCHEDULED",
      patient: { id: "pat-103", name: "Amit Verma", gender: "Male", age: 45, phone: "+91 99887 76655" },
      vitals: null,
      billing: { totalAmount: 700, paymentStatus: "UNPAID" }
    },
    {
      id: "apt-4",
      patientId: "pat-104",
      patientName: "Sneha Kulkarni",
      doctor: "Dr. Ananya Sharma",
      doctorId: "doc-101",
      date: new Date().toISOString().split("T")[0],
      time: "11:30 AM",
      tokenNumber: 4,
      status: "Scheduled",
      rawStatus: "SCHEDULED",
      patient: { id: "pat-104", name: "Sneha Kulkarni", gender: "Female", age: 36, phone: "+91 98711 22334" },
      vitals: null,
      billing: { totalAmount: 500, paymentStatus: "UNPAID" }
    }
  ];

  try {
    let orgId = request.headers.get("x-org-id");
    
    // Fallback for development if orgId is not provided by the frontend
    if (!orgId) {
      const user = await getUser();
      orgId = (user?.orgId as string) || "org-1";
    }

    const url = new URL(request.url);
    const doctorId = url.searchParams.get("doctorId");
    const dateParam = url.searchParams.get("date");

    const whereClause: any = { organizationId: orgId };
    
    if (doctorId) {
      whereClause.doctorId = doctorId;
    }

    if (dateParam === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      whereClause.appointmentDate = { gte: today };
    } else if (dateParam) {
      const specificDate = new Date(dateParam);
      specificDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(specificDate);
      nextDay.setDate(nextDay.getDate() + 1);
      whereClause.appointmentDate = { gte: specificDate, lt: nextDay };
    }

    let appointments: any[] = [];
    try {
      appointments = await prisma.healthAppointment.findMany({
        where: whereClause,
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
    } catch (dbErr) {
      logger.warn("Database unreachable in /api/appointments, using fallback demo data:", dbErr);
      appointments = [];
    }

    if (!appointments || appointments.length === 0) {
      return NextResponse.json(fallbackAppointments);
    }

    const formatted = appointments.map((apt: any) => ({
      id: apt.id,
      patientId: apt.patientId,
      patientName: apt.patient?.name || "Anonymous Patient",
      doctor: apt.doctor?.name || "Unassigned",
      doctorId: apt.doctorId,
      date: apt.appointmentDate ? apt.appointmentDate.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
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
    return NextResponse.json(fallbackAppointments);
  }
});

export const POST = withPermission('appointment:create', async (request: Request) => {
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
    const timeSlot = body.time || body.timeSlot || "10:00 AM";

    // --- SLOT VALIDATION & LOCKING ---
    let lockKey = null;
    if (doctorId && body.date) {
      const existingBooking = await prisma.healthAppointment.findFirst({
        where: {
          doctorId,
          appointmentDate: apptDate,
          timeSlot: timeSlot,
          status: { notIn: [ApptStatus.CANCELLED] },
        },
      });

      if (existingBooking) {
        return NextResponse.json(
          { error: "Slot already booked. Please pick another." },
          { status: 409 }
        );
      }

      // Check doctor not on leave
      const onLeave = await prisma.doctorTimeOff.findFirst({
        where: {
          doctorId,
          date: apptDate,
        },
      });

      if (onLeave) {
        return NextResponse.json(
          { error: "Doctor is unavailable on this date" },
          { status: 409 }
        );
      }

      const datetime = body.datetime || `${body.date}T${timeSlot}:00`;
      lockKey = `slot-lock:${doctorId}:${datetime}`;
    }

    const newAppointment = await prisma.healthAppointment.create({
      data: {
        organizationId: orgId,
        patientId,
        doctorId: doctorId || null,
        appointmentDate: apptDate,
        timeSlot: timeSlot,
        status: mapToApptStatus(body.status),
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (lockKey) {
      try {
        const { redis } = await import("@/lib/redis");
        await redis.del(lockKey);
      } catch (e) {
        logger.error("Failed to release slot lock", e);
      }
    }

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

      if (newAppointment.doctorId) {
      publishEvent(`org:${orgId}:doctor:${newAppointment.doctorId}`, {
        type: "appointment.created",
        payload: {
          id: newAppointment.id,
          orgId,
          appointmentId: newAppointment.id,
          patientName: newAppointment.patient?.name,
          timeSlot: newAppointment.timeSlot,
          tokenNumber: newAppointment.tokenDisplay || `TKN-${newAppointment.tokenNumber}`
        } as any,
        orgId,
        doctorId: newAppointment.doctorId
      });
      publishEvent(`org:${orgId}:appointments`, {
        type: "appointment.created",
        payload: {
          id: newAppointment.id,
          orgId,
          appointmentId: newAppointment.id,
        } as any,
        orgId
      });
    }

    return NextResponse.json(
      { message: "Appointment booked successfully", appointment: responseData },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Error booking appointment:", error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 400 });
  }
});

export const PUT = withPermission('appointment:update', async (request: Request) => {
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

    if (updated.doctorId) {
      publishEvent(`org:${updated.organizationId}:doctor:${updated.doctorId}`, {
        type: status === "Arrived" ? "patient.checked_in" : "appointment.updated",
        payload: {
          id: updated.id,
          orgId: updated.organizationId,
          appointmentId: updated.id,
          patientName: updated.patient?.name,
          timeSlot: updated.timeSlot,
          status: updated.status,
          tokenNumber: updated.tokenDisplay
        } as any,
        orgId: updated.organizationId,
        doctorId: updated.doctorId
      });
    }

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
});
