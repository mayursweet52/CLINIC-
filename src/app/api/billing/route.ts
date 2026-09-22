import logger from '@/lib/logger';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

export async function GET(req: Request) {
  try {
    const bills = await prisma.billing.findMany({
      include: {
        appointment: {
          include: {
            patient: true,
            doctor: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(bills);
  } catch (error) {
    logger.error("Error in billing GET:", error);
    return NextResponse.json({ error: "Failed to fetch bills" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { billId, paymentStatus } = body;

    if (!billId || !paymentStatus) {
      return NextResponse.json({ error: "Bill ID and payment status required" }, { status: 400 });
    }

    const before = await prisma.billing.findUnique({ where: { id: billId } });

    const updatedBill = await prisma.billing.update({
      where: { id: billId },
      data: { paymentStatus }
    });

    const user = await getUser();

    logAction({
      userId: (user?.userId as string) || 'system',
      orgId: (user?.orgId as string) || updatedBill.organizationId,
      action: 'UPDATE',
      resource: 'Billing',
      resourceId: updatedBill.id,
      before,
      after: updatedBill,
      req
    });

    return NextResponse.json({ success: true, bill: updatedBill });
  } catch (error) {
    logger.error("Error updating bill:", error);
    return NextResponse.json({ error: "Failed to update payment status" }, { status: 500 });
  }
}
