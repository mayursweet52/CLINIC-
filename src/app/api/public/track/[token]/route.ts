import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;

    const appointment = await prisma.healthAppointment.findUnique({
      where: { publicToken: token },
      include: {
        patient: true,
        doctor: true,
        organization: true,
        billing: true,
        visit: {
          include: {
            prescriptions: true,
          }
        }
      }
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const { patient, doctor, organization, billing, visit } = appointment;
    const hasPrescription = visit?.prescriptions && visit.prescriptions.length > 0 ? true : false;
    const isPrescriptionReady = visit?.prescriptions?.[0]?.status === "DISPENSED";
    const billPaid = billing?.paymentStatus === "PAID";

    const timeline = [
      { step: 1, label: "Booking Confirmed", completed: true },
      { step: 2, label: "Checked In", completed: ["ARRIVED", "IN_CONSULTATION", "COMPLETED"].includes(appointment.status) },
      { step: 3, label: "With Doctor", completed: ["IN_CONSULTATION", "COMPLETED"].includes(appointment.status) },
      { step: 4, label: "Prescription Ready", completed: isPrescriptionReady },
      { step: 5, label: "Payment", completed: billPaid },
      { step: 6, label: "Visit Complete", completed: isPrescriptionReady && billPaid },
    ];

    return NextResponse.json({
      appointment: {
        id: appointment.id,
        appointmentNo: appointment.appointmentNo,
        date: appointment.appointmentDate,
        time: appointment.timeSlot,
        token: appointment.tokenDisplay,
        status: appointment.status,
      },
      patient: {
        firstName: patient.name.split(" ")[0],
      },
      doctor: doctor ? {
        name: doctor.name,
      } : null,
      clinic: {
        name: organization.name,
        address: organization.address,
        city: organization.city,
        phone: organization.phone,
      },
      timeline,
      hasPrescription,
      prescriptionId: hasPrescription ? visit?.prescriptions[0].id : null,
      billToken: billing?.publicToken || null,
      billPaid,
    });

  } catch (error) {
    console.error("Public Track API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
