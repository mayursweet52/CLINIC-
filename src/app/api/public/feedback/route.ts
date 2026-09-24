import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const FeedbackSchema = z.object({
  appointmentId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = FeedbackSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.issues }, { status: 400 });
    }

    const { appointmentId, rating, comment } = parsed.data;

    const appointment = await prisma.healthAppointment.findUnique({
      where: { id: appointmentId },
      include: { 
        review: true,
        billing: true,
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.status !== "COMPLETED") {
      return NextResponse.json({ error: "Visit not complete" }, { status: 400 });
    }

    if (appointment.billing?.paymentStatus !== "PAID") {
      return NextResponse.json({ error: "Payment pending" }, { status: 400 });
    }

    if (appointment.review) {
      return NextResponse.json({ error: "Already reviewed" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 7a. Create review
      const review = await tx.review.create({
        data: {
          organizationId: appointment.organizationId,
          patientId: appointment.patientId,
          doctorId: appointment.doctorId || "",
          appointmentId: appointment.id,
          rating,
          comment: comment || null,
        },
      });

      // 7b. Recalculate doctor rating
      const agg = await tx.review.aggregate({
        where: { doctorId: appointment.doctorId || "", isPublic: true },
        _avg: { rating: true },
        _count: true,
      });
      
      await tx.user.update({
        where: { id: appointment.doctorId || "" },
        data: {
          averageRating: agg._avg?.rating || 0,
          totalReviews: (typeof agg._count === "number" ? agg._count : (agg._count as any)?._all) || 0,
        },
      });

      // 7c. Recalculate org rating
      const orgAgg = await tx.review.aggregate({
        where: { organizationId: appointment.organizationId, isPublic: true },
        _avg: { rating: true },
        _count: true,
      });
      
      await tx.organization.update({
        where: { id: appointment.organizationId || "" },
        data: {
          rating: orgAgg._avg.rating || 0,
          totalReviews: orgAgg._count,
        },
      });

      return review;
    });

    return NextResponse.json({ success: true, review: result });

  } catch (error) {
    console.error("Feedback API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
