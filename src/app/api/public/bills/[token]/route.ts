import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function maskPhone(phone: string | null) {
  if (!phone) return "";
  if (phone.length < 4) return phone;
  const start = phone.slice(0, 2);
  const end = phone.slice(-2);
  const masked = "X".repeat(phone.length - 4);
  return `${start}${masked}${end}`;
}

export async function GET(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;

    const bill = await prisma.billing.findUnique({
      where: { publicToken: token },
      include: {
        appointment: {
          include: {
            doctor: true,
            organization: true,
            patient: true,
          }
        },
      }
    });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    const { appointment } = bill;
    const { patient, doctor, organization } = appointment;

    return NextResponse.json({
      bill: {
        id: bill.id,
        invoiceNo: bill.invoiceNo,
        totalAmount: bill.totalAmount,
        consultationFee: bill.consultationFee,
        medicineCharges: bill.medicineCharges,
        paymentStatus: bill.paymentStatus,
        createdAt: bill.createdAt,
              },
      patient: {
        firstName: patient.name.split(" ")[0],
        patientCode: patient.patientCode,
        phone: maskPhone(patient.phone),
      },
      doctor: doctor ? {
        name: doctor.name,
      } : null,
      clinic: {
        name: organization.name,
        address: organization.address,
        city: organization.city,
        phone: organization.phone,
        logoUrl: organization.logoUrl,
      },
    });

  } catch (error) {
    console.error("Public Bill API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
