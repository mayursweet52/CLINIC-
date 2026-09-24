import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { z } from "zod";

const UpdateClinicSchema = z.object({
  name: z.string().min(2).optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  pincode: z.string().min(6).max(10).optional(),
  address: z.string().min(5).optional(),
  phone: z.string().min(10).optional(),
  isActive: z.boolean().optional(),
});

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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;

  try {
    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true, patients: true }
        },
        users: {
          where: { role: "DOCTOR" },
          select: { id: true }
        },
        departments: {
          select: { name: true, slug: true, icon: true }
        }
      }
    });

    if (!org) {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const appointmentsCount = await prisma.healthAppointment.count({
      where: {
        organizationId: id,
        createdAt: { gte: thirtyDaysAgo }
      }
    });

    const revenueResult = await prisma.billing.aggregate({
      where: {
        organizationId: id,
        paymentStatus: "PAID"
      },
      _sum: { totalAmount: true }
    });

    const detail = {
      id: org.id,
      name: org.name,
      slug: org.slug,
      domain: org.domain,
      address: org.address,
      city: org.city,
      state: org.state,
      pincode: org.pincode,
      phone: org.phone,
      rating: org.rating,
      totalReviews: org.totalReviews,
      isActive: org.isActive,
      plan: org.plan,
      createdAt: org.createdAt,
      counts: {
        users: org._count.users,
        patients: org._count.patients,
        doctors: org.users.length,
        appointments30d: appointmentsCount
      },
      revenue: revenueResult._sum.totalAmount || 0,
      departments: org.departments
    };

    return NextResponse.json({ clinic: detail });
  } catch (error) {
    console.error("Failed to fetch clinic details", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = UpdateClinicSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
    }

    const updated = await prisma.organization.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true, name: true, slug: true, address: true, city: true, state: true, phone: true, isActive: true
      }
    });

    return NextResponse.json({ success: true, clinic: updated });
  } catch (error: any) {
    console.error("Failed to update clinic", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireSuperAdmin();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;

  try {
    await prisma.organization.update({
      where: { id },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete clinic", error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Clinic not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
