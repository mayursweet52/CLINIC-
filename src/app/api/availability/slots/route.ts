import logger from "@/lib/logger";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/availability/slots?doctorId=X&date=YYYY-MM-DD
 *
 * Public endpoint — no auth required.
 * Returns time slots for a given doctor on a given date.
 * Subtracts booked appointments to mark unavailable slots.
 *
 * Response shape:
 * [{ time: "09:00", available: boolean }]
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");
    const dateParam = searchParams.get("date"); // "YYYY-MM-DD"

    if (!doctorId || !dateParam) {
      return NextResponse.json(
        { error: "doctorId and date are required" },
        { status: 400 }
      );
    }

    // Parse the requested date
    const requestedDate = new Date(`${dateParam}T00:00:00.000Z`);
    if (isNaN(requestedDate.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    const dayOfWeek = requestedDate.getUTCDay(); // 0=Sun … 6=Sat

    // 1. Get availability for that day of week
    const availability = await prisma.doctorAvailability.findUnique({
      where: {
        doctorId_dayOfWeek: { doctorId, dayOfWeek },
      },
    });

    // Doctor not available this day
    if (!availability || !availability.isActive) {
      return NextResponse.json([]);
    }

    // 2. Check for time-off on this specific date
    const startOfDay = new Date(`${dateParam}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateParam}T23:59:59.999Z`);

    const timeOff = await prisma.doctorTimeOff.findFirst({
      where: {
        doctorId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (timeOff) {
      // Return empty array — caller can check separately via /api/timeoff
      return NextResponse.json([]);
    }

    // 3. Fetch existing appointments for this doctor on this date
    const bookedAppointments = await prisma.healthAppointment.findMany({
      where: {
        doctorId,
        appointmentDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: {
          notIn: ["CANCELLED"],
        },
      },
      select: { timeSlot: true },
    });

    // Normalise booked time strings to "HH:MM" (some stored as "09:00 AM")
    const bookedTimes = new Set(
      bookedAppointments.map((a) => normaliseTime(a.timeSlot))
    );

    // 4. Generate all slots within the availability window
    const slots = generateSlots(
      availability.startTime,
      availability.endTime,
      availability.slotDuration
    );

    // 5. Mark each slot available or not
    const result = slots.map((time) => ({
      time,
      available: !bookedTimes.has(time),
    }));

    return NextResponse.json(result);
  } catch (error) {
    logger.error({ err: error }, "Error fetching slots");
    return NextResponse.json(
      { error: "Failed to fetch slots" },
      { status: 500 }
    );
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Generate an array of "HH:MM" slot start-times from startTime to endTime
 * (exclusive of endTime) with the given duration in minutes.
 */
function generateSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number
): string[] {
  const slots: string[] = [];

  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  let current = startH * 60 + startM;
  const end = endH * 60 + endM;

  while (current + durationMinutes <= end) {
    const h = Math.floor(current / 60);
    const m = current % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    current += durationMinutes;
  }

  return slots;
}

/**
 * Normalise a time string to 24-hour "HH:MM".
 * Handles "09:00", "9:00 AM", "01:00 PM", etc.
 */
function normaliseTime(raw: string): string {
  if (!raw) return "";
  raw = raw.trim();

  // Already 24h format like "09:00" or "14:30"
  if (/^\d{1,2}:\d{2}$/.test(raw)) {
    const [h, m] = raw.split(":").map(Number);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  // 12-hour with AM/PM like "09:00 AM" or "1:30 PM"
  const match = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === "AM" && h === 12) h = 0;
    if (period === "PM" && h !== 12) h += 12;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  return raw;
}
