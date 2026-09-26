import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

async function requireAdmin() {
  const token = (await cookies()).get("auth_token")?.value;
  if (!token) return { error: "Unauthorized", status: 401 };
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );
    if (payload.role !== "ADMIN") {
      return { error: "Forbidden", status: 403 };
    }
    return { user: payload };
  } catch {
    return { error: "Invalid token", status: 401 };
  }
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const orgId = auth.user!.orgId as string;
    
    if (!orgId) {
      return NextResponse.json({ error: "No organization associated" }, { status: 400 });
    }

    const [totalStaff, totalPatients, totalRevenueData, activeDoctors] = await Promise.all([
      prisma.user.count({ where: { organizationId: orgId, role: { not: "SUPERADMIN" } } }),
      prisma.patient.count({ where: { organizationId: orgId } }),
      prisma.billing.aggregate({
        _sum: { totalAmount: true },
        where: { organizationId: orgId, paymentStatus: "PAID" },
      }),
      prisma.user.count({ where: { organizationId: orgId, role: "DOCTOR" } })
    ]);

    const recentActivity = await prisma.auditLog.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    
    // Fetch users for these logs
    const userIds = [...new Set(recentActivity.map(l => l.userId).filter(Boolean))] as string[];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, role: true }
    });
    const userMap = new Map(users.map(u => [u.id, u]));

    const formattedActivity = recentActivity.map(log => {
      // simple time ago logic
      const diffMs = Date.now() - new Date(log.createdAt).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      let timeAgo = `${diffMins} mins ago`;
      if (diffMins > 60) timeAgo = `${Math.floor(diffMins / 60)} hours ago`;
      if (diffMins > 1440) timeAgo = `${Math.floor(diffMins / 1440)} days ago`;
      
      const u = log.userId ? userMap.get(log.userId) : null;
      
      return {
        id: log.id,
        action: `${log.action} ${log.resource}`,
        user: u ? u.name : 'System',
        timeAgo
      };
    });

    return NextResponse.json({
      stats: {
        totalStaff,
        totalPatients,
        revenueMonth: totalRevenueData._sum?.totalAmount || 0,
        activeDoctors
      },
      recentActivity: formattedActivity
    });
  } catch (error) {
    console.error("Admin Stats API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
