import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateInvoicePDF } from "@/lib/pdf/invoice";

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;

    const bill = await prisma.billing.findUnique({
      where: { publicToken: token },
      include: {
        appointment: {
          include: {
            organization: true,
            patient: true,
          }
        }
      }
    });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    const buffer = await generateInvoicePDF(
      bill,
      bill.appointment.patient,
      bill.appointment.organization,
      bill.appointment
    );

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${bill.invoiceNo}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Public Bill PDF API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
