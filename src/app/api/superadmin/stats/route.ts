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
  try {
    const auth = await requireSuperAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const [totalClinics, totalStaff, totalPatients, totalRevenueData] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count({ where: { role: { not: "SUPERADMIN" } } }),
      prisma.patient.count(),
      prisma.billing.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: "PAID" },
      }),
    ]);

    return NextResponse.json({
      clinics: totalClinics,
      staff: totalStaff,
      patients: totalPatients,
      revenue: totalRevenueData._sum?.totalAmount || 0,
    });
  } catch (error) {
    console.error("SuperAdmin Stats API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
