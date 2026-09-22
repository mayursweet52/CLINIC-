import logger from "@/lib/logger";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/withPermission";

// GET /api/timeoff?doctorId=X&orgId=Y
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");
    const orgId = searchParams.get("orgId");

    if (!doctorId) {
      return NextResponse.json(
        { error: "doctorId is required" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { doctorId };
    if (orgId) where.orgId = orgId;

    const timeOffs = await prisma.doctorTimeOff.findMany({
      where,
      orderBy: { date: "asc" },
    });

    return NextResponse.json(timeOffs);
  } catch (error) {
    logger.error({ err: error }, "Error fetching time-off");
    return NextResponse.json(
      { error: "Failed to fetch time-off" },
      { status: 500 }
    );
  }
}

// POST /api/timeoff  (admin or doctor role required)
export const POST = withPermission(
  "appointment:create",
  async (request: Request) => {
    try {
      const user = (request as any).user as {
        userId: string;
        role: string;
        orgId: string;
      };

      const body = await request.json();
      const { doctorId, date, reason, orgId } = body;

      const resolvedDoctorId =
        user.role?.toUpperCase() === "DOCTOR" ? user.userId : doctorId;

      if (!resolvedDoctorId || !date) {
        return NextResponse.json(
          { error: "doctorId and date are required" },
          { status: 400 }
        );
      }

      let resolvedOrgId: string = orgId || user.orgId;
      if (!resolvedOrgId) {
        const doctor = await prisma.user.findUnique({
          where: { id: resolvedDoctorId },
          select: { organizationId: true },
        });
        if (!doctor) {
          return NextResponse.json(
            { error: "Doctor not found" },
            { status: 404 }
          );
        }
        resolvedOrgId = doctor.organizationId;
      }

      const parsedDate = new Date(date);
      // Normalize to start-of-day UTC so the @@unique constraint works consistently
      parsedDate.setUTCHours(0, 0, 0, 0);

      const timeOff = await prisma.doctorTimeOff.upsert({
        where: {
          doctorId_date: {
            doctorId: resolvedDoctorId,
            date: parsedDate,
          },
        },
        update: { reason: reason ?? null },
        create: {
          doctorId: resolvedDoctorId,
          date: parsedDate,
          reason: reason ?? null,
          orgId: resolvedOrgId,
        },
      });

      try {
        const { publishEvent } = await import("@/lib/events");
        await publishEvent(`org:${resolvedOrgId}:appointments`, {
          type: "appointment.updated" as any,
          payload: { id: timeOff.id, orgId: resolvedOrgId, doctorId: resolvedDoctorId, startAt: parsedDate, endAt: parsedDate, event: "doctor.leave.marked" },
          timestamp: new Date().toISOString(),
        });
      } catch (evtError) {
        logger.error({ err: evtError }, "Failed to publish doctor.leave.marked event");
      }

      return NextResponse.json(timeOff, { status: 201 });
    } catch (error) {
      logger.error({ err: error }, "Error adding time-off");
      return NextResponse.json(
        { error: "Failed to add time-off" },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/timeoff  body: { id } or { doctorId, date }
export const DELETE = withPermission(
  "appointment:create",
  async (request: Request) => {
    try {
      const user = (request as any).user as {
        userId: string;
        role: string;
        orgId: string;
      };

      const body = await request.json();
      const { id, doctorId, date } = body;

      if (id) {
        // Doctors can only remove their own time-off
        const existing = await prisma.doctorTimeOff.findUnique({
          where: { id },
        });
        if (!existing) {
          return NextResponse.json(
            { error: "Time-off not found" },
            { status: 404 }
          );
        }
        if (
          user.role?.toUpperCase() === "DOCTOR" &&
          existing.doctorId !== user.userId
        ) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        await prisma.doctorTimeOff.delete({ where: { id } });
        return NextResponse.json({ message: "Time-off removed" });
      }

      if (doctorId && date) {
        const resolvedDoctorId =
          user.role?.toUpperCase() === "DOCTOR" ? user.userId : doctorId;
        const parsedDate = new Date(date);
        parsedDate.setUTCHours(0, 0, 0, 0);

        await prisma.doctorTimeOff.delete({
          where: {
            doctorId_date: {
              doctorId: resolvedDoctorId,
              date: parsedDate,
            },
          },
        });
        return NextResponse.json({ message: "Time-off removed" });
      }

      return NextResponse.json(
        { error: "Provide id or doctorId+date" },
        { status: 400 }
      );
    } catch (error) {
      logger.error({ err: error }, "Error removing time-off");
      return NextResponse.json(
        { error: "Failed to remove time-off" },
        { status: 500 }
      );
    }
  }
);
