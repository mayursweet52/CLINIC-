import logger from "@/lib/logger";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/withPermission";

// GET /api/availability?doctorId=X&orgId=Y
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

    const availabilities = await prisma.doctorAvailability.findMany({
      where,
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json(availabilities);
  } catch (error) {
    logger.error({ err: error }, "Error fetching availability");
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

// POST /api/availability  (admin or doctor role required)
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
      const { doctorId, dayOfWeek, startTime, endTime, slotDuration, isActive, orgId } =
        body;

      // Doctors can only update their own availability
      const resolvedDoctorId =
        user.role?.toUpperCase() === "DOCTOR" ? user.userId : doctorId;

      if (
        resolvedDoctorId === undefined ||
        dayOfWeek === undefined ||
        !startTime ||
        !endTime
      ) {
        return NextResponse.json(
          { error: "doctorId, dayOfWeek, startTime, endTime are required" },
          { status: 400 }
        );
      }

      // Resolve orgId: prefer body, fallback to token, fallback to DB
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
        resolvedOrgId = doctor.organizationId!;
      }

      const availability = await prisma.doctorAvailability.upsert({
        where: {
          doctorId_dayOfWeek: {
            doctorId: resolvedDoctorId,
            dayOfWeek: Number(dayOfWeek),
          },
        },
        update: {
          startTime,
          endTime,
          slotDuration: slotDuration ?? 15,
          isActive: isActive !== undefined ? Boolean(isActive) : true,
        },
        create: {
          doctorId: resolvedDoctorId,
          dayOfWeek: Number(dayOfWeek),
          startTime,
          endTime,
          slotDuration: slotDuration ?? 15,
          isActive: isActive !== undefined ? Boolean(isActive) : true,
          orgId: resolvedOrgId,
        },
      });

      return NextResponse.json(availability, { status: 201 });
    } catch (error) {
      logger.error({ err: error }, "Error saving availability");
      return NextResponse.json(
        { error: "Failed to save availability" },
        { status: 500 }
      );
    }
  }
);
