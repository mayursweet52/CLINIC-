import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    console.error("Error in billing GET:", error);
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

    const updatedBill = await prisma.billing.update({
      where: { id: billId },
      data: { paymentStatus }
    });
    return NextResponse.json({ success: true, bill: updatedBill });
  } catch (error) {
    console.error("Error updating bill:", error);
    return NextResponse.json({ error: "Failed to update payment status" }, { status: 500 });
  }
}

