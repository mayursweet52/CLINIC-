import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redis } from "@/lib/redis";

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("auth_token")?.value;
    let userId = "guest";
    if (token) {
      try {
        const { payload } = await jwtVerify(
          token,
          new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-key-for-businessos-health-12345")
        );
        userId = payload.userId as string;
      } catch {}
    }

    const { doctorId, datetime } = await req.json();
    if (!doctorId || !datetime) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const lockKey = `slot-lock:${doctorId}:${datetime}`;
    const locked = await redis.set(
      lockKey,
      userId,
      "EX", 300,   // 5 minutes
      "NX"         // Only if not exists
    );

    if (!locked) {
      return NextResponse.json(
        { locked: false, reason: "Someone else is booking this slot" },
        { status: 409 }
      );
    }

    return NextResponse.json({ locked: true, expiresIn: 300 });
  } catch (error) {
    return NextResponse.json({ error: "Lock failed" }, { status: 500 });
  }
}
