import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

async function requireSuperAdmin() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return { error: "Unauthorized", status: 401 };
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    if (payload.role !== "SUPERADMIN") {
      return { error: "Forbidden", status: 403 };
    }
    return { user: payload };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
}

export async function GET() {
  const auth = await requireSuperAdmin();
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const [
      totalClinics,
      activeClinics,
      totalUsers,
      totalPatients,
      totalAppointments,
      revenueResult,
      recentClinics
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.organization.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: { not: "SUPERADMIN" } } }),
      prisma.patient.count(),
      prisma.healthAppointment.count(),
      prisma.billing.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { totalAmount: true }
      }),
      prisma.organization.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, slug: true, city: true, isActive: true, createdAt: true }
      })
    ]);

    return NextResponse.json({
      totalClinics,
      activeClinics,
      totalUsers,
      totalPatients,
      totalAppointments,
      totalRevenue: revenueResult._sum.totalAmount || 0,
      recentClinics
    });
  } catch (error) {
    console.error("Failed to fetch superadmin metrics", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
