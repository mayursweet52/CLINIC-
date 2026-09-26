import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { z } from "zod";
import { redis } from "@/lib/redis";
import {
  expandShorthand,
  triage,
  differentialDiagnosis,
  checkDrugInteractions,
} from "@/lib/ai/gemini";

const aiRequestSchema = z.object({
  action: z.enum(["shorthand", "triage", "diagnosis", "interaction"]),
  payload: z.any(),
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "super-secret-key-for-businessos-health-12345"
    );
    const { payload } = await jwtVerify(token, secret);

    const role = (payload.role as string)?.toUpperCase();
    const doctorId = payload.userId as string;

    if (role !== "DOCTOR") {
      return NextResponse.json({ error: "Forbidden: DOCTOR role only" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = aiRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    // Rate Limiting (20 per hour)
    const hour = new Date().toISOString().slice(0, 13); // yyyy-mm-ddThh
    const redisKey = `ai:${doctorId}:${hour}`;
    
    // Increment and get current count
    const calls = await redis.incr(redisKey);
    
    if (calls === 1) {
      // Set expiration to 1 hour (3600 seconds) if this is the first call this hour
      await redis.expire(redisKey, 3600);
    }

    if (calls > 20) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Maximum 20 AI requests per hour." },
        { status: 429 }
      );
    }

    const { action, payload: data } = parsed.data;
    let result;

    switch (action) {
      case "shorthand":
        result = await expandShorthand(data.text);
        break;
      case "triage":
        result = await triage(data.symptoms, data.vitals);
        break;
      case "diagnosis":
        result = await differentialDiagnosis(data.symptoms, data.age, data.gender);
        break;
      case "interaction":
        result = await checkDrugInteractions(data.medicines);
        break;
    }

    return NextResponse.json({ result });
  } catch (error) {
    console.error("AI API Error:", error);
    // Fallback: don't crash, return a graceful error
    return NextResponse.json(
      { error: "AI unavailable at the moment", details: (error as any).message },
      { status: 503 }
    );
  }
}
