import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { subscribeToChannel } from "@/lib/events";
import { ClinicEvent } from "@/lib/events.types";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  
  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-key-for-businessos-health-12345");
    const verified = await jwtVerify(token, secret);
    payload = verified.payload;
  } catch (err) {
    return new Response("Invalid token", { status: 401 });
  }

  const orgId = (payload.orgId as string) || "org-1";
  const role = (payload.role as string)?.toLowerCase() || "receptionist";
  const userId = (payload.userId as string) || "user-1";

  // Determine subscription channel based on role
  let channel = `org:${orgId}:*`; // default to admin (wildcard)
  if (role === "doctor") {
    channel = `org:${orgId}:doctor:${userId}`;
  } else if (role === "receptionist") {
    channel = `org:${orgId}:appointments`;
  }

  let unsubscribe: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      
      // Send initial connection event
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ channel })}\n\n`)
      );

      // Subscribe to Redis
      unsubscribe = subscribeToChannel(channel, (event: ClinicEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      });

      // Heartbeat every 30s to keep connection alive
      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`event: heartbeat\ndata: ping\n\n`));
      }, 30000);

      // Handle client disconnect
      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        if (unsubscribe) unsubscribe();
        try {
          controller.close();
        } catch (e) {
          // ignore stream already closed error
        }
      });
    },
    cancel() {
      if (unsubscribe) unsubscribe();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no"
    },
  });
}
