import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import * as jose from "jose";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("patient_token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "super-secret-key-for-businessos-health-12345"
    );

    const { payload } = await jose.jwtVerify(token, secret);
    const patientId = payload.patientId as string;

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        appointments: {
          include: { doctor: true, visit: true },
          orderBy: { appointmentDate: "desc" },
          take: 20,
        },
        prescriptions: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        labReports: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // Format for frontend PatientDashboard type
    const upcomingAppt = patient.appointments.find(a => new Date(a.appointmentDate) >= new Date() && a.status !== 'CANCELLED');
    
    const mappedDashboard = {
      id: patient.id,
      name: patient.name,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=0D8ABC&color=fff`,
      upcomingAppointment: upcomingAppt ? {
        id: upcomingAppt.id,
        doctorName: upcomingAppt.doctor?.name || "Doctor",
        specialty: upcomingAppt.doctor?.specialization || "General",
        date: upcomingAppt.appointmentDate.toISOString().split('T')[0],
        time: upcomingAppt.timeSlot || '00:00',
        status: upcomingAppt.status
      } : null,
      recentPrescriptions: patient.prescriptions.map((rx: any) => ({
        id: rx.id,
        date: rx.createdAt.toISOString().split('T')[0],
        doctorName: "Doctor", // rx.doctorId not directly available if not included, but it's mock info for now
        medicines: rx.medicines ? (Array.isArray(rx.medicines) ? rx.medicines.length : 1) : 0
      })),
      pendingBills: [] // Bills are linked via appointments, skipping for now
    };

    return NextResponse.json(mappedDashboard);
  } catch (error) {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }
}
