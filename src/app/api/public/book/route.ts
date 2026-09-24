import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { nanoid } from "nanoid";

const BookSchema = z.object({
  clinicId: z.string(),
  departmentId: z.string().optional(),
  conditionId: z.string().optional(),
  doctorId: z.string(),
  appointmentDate: z.string(), // ISO String
  timeSlot: z.string(), // "10:00"
  patientName: z.string().min(2),
  patientPhone: z.string().min(10),
  patientEmail: z.string().email().optional().or(z.literal('')),
  reason: z.string().min(2),
  symptoms: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = BookSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
    }

    const {
      clinicId, doctorId, appointmentDate, timeSlot,
      patientName, patientPhone, patientEmail, reason
    } = parsed.data;

    // 1. Verify Clinic
    const clinic = await prisma.organization.findUnique({
      where: { id: clinicId, isActive: true }
    });
    if (!clinic) return NextResponse.json({ error: "Clinic not found or inactive" }, { status: 404 });

    // 2. Verify Doctor
    const doctor = await prisma.user.findFirst({
      where: { id: doctorId, organizationId: clinicId, role: "DOCTOR", isActive: true },
      include: { profile: true }
    });
    if (!doctor) return NextResponse.json({ error: "Doctor not found or unavailable" }, { status: 404 });

    const apptDate = new Date(appointmentDate);
    
    // 3. Verify Slot (Mocking Redis lock via DB transaction check)
    // Query existing appointments for (doctorId, date, timeSlot) with status NOT IN (CANCELLED, NO_SHOW)
    const existing = await prisma.healthAppointment.findFirst({
      where: {
        doctorId,
        appointmentDate: apptDate,
        timeSlot,
        status: { notIn: ["CANCELLED"] }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Slot already booked" }, { status: 409 });
    }

    // 4. Upsert Patient
    let patient = await prisma.patient.findFirst({
      where: { organizationId: clinicId, phone: patientPhone }
    });

    if (!patient) {
      patient = await prisma.patient.create({
        data: {
          organizationId: clinicId,
          patientCode: `PT-${Date.now().toString().slice(-6)}`,
          name: patientName,
          phone: patientPhone,
          email: patientEmail,
          gender: "UNKNOWN", // Defaulting for quick booking
        }
      });
    }

    // 5. Generate Token
    // Count today's appointments for doctorId to generate token
    const startOfDay = new Date(apptDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(apptDate);
    endOfDay.setHours(23, 59, 59, 999);

    const count = await prisma.healthAppointment.count({
      where: {
        doctorId,
        appointmentDate: { gte: startOfDay, lte: endOfDay }
      }
    });

    const tokenNumber = count + 1;
    const tokenDisplay = `Q-${tokenNumber.toString().padStart(3, '0')}`;
    const publicToken = nanoid(12);

    // 6. Transaction to create Appointment and Billing
    const transaction = await prisma.$transaction(async (tx) => {
      const appointment = await tx.healthAppointment.create({
        data: {
          organizationId: clinicId,
          patientId: patient!.id,
          doctorId,
          appointmentDate: apptDate,
          timeSlot,
          status: 'SCHEDULED',
          tokenNumber,
          tokenDisplay,
          publicToken,
          reason,
        }
      });

      const consultationFee = doctor.profile?.consultationFee || 500;

      const billing = await tx.billing.create({
        data: {
          organizationId: clinicId,
          appointmentId: appointment.id,
          invoiceNo: `INV-${Date.now()}`,
          consultationFee,
          totalAmount: consultationFee,
          paymentStatus: 'UNPAID',
        }
      });

      return { appointment, billing };
    });

    // Fire & Forget: Publish real-time events via whatever mechanism you have
    // eventBus.publish(`org:${clinicId}:appointments`, transaction.appointment);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    return NextResponse.json({
      success: true,
      appointment: {
        id: transaction.appointment.id,
        tokenNumber,
        tokenDisplay,
        publicToken,
        appointmentDate: transaction.appointment.appointmentDate,
        timeSlot: transaction.appointment.timeSlot,
      },
      trackingUrl: `${baseUrl}/t/${publicToken}`,
      patient: { id: patient.id, name: patient.name, patientCode: patient.patientCode }
    });

  } catch (error) {
    console.error("Booking API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
