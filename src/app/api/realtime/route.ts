import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { eventBus, subscribeToChannel } from "@/lib/events";
import { ClinicEvent } from "@/lib/events.types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  let orgId = searchParams.get("orgId") || undefined;
  let doctorId = searchParams.get("doctorId") || undefined;
  let role = "receptionist";
  let userId = "user-1";

  // Check auth_token cookie if present
  const token = req.cookies.get("auth_token")?.value;
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "super-secret-key-for-businessos-health-12345");
      const verified = await jwtVerify(token, secret);
      const payload = verified.payload;
      orgId = (payload.orgId as string) || orgId || "org-1";
      role = (payload.role as string)?.toLowerCase() || role;
      userId = (payload.userId as string) || userId;
      if (role === "doctor" && !doctorId) {
        doctorId = userId;
      }
    } catch (err) {
      // Allow unauthenticated SSE only if explicit public params provided (e.g. TV queue screen)
      if (!orgId) {
        return new Response("Unauthorized", { status: 401 });
      }
    }
  }

  // Determine subscription channel
  const currentOrg = orgId || "org-1";
  let channel = `org:${currentOrg}:*`;
  if (role === "doctor" && doctorId) {
    channel = `org:${currentOrg}:doctor:${doctorId}`;
  } else if (role === "receptionist") {
    channel = `org:${currentOrg}:appointments`;
  }

  let unsubscribe: (() => void) | undefined;
  let heartbeatTimer: NodeJS.Timeout | null = null;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection packet
      const initData = JSON.stringify({
        connected: true,
        channel,
        timestamp: new Date().toISOString(),
        activeSubscribers: eventBus.getSubscriberCount() + 1,
        recentEvents: eventBus.getHistory(5, orgId)
      });
      controller.enqueue(encoder.encode(`event: connected\ndata: ${initData}\n\n`));

      // Subscribe to Redis / EventBus
      unsubscribe = subscribeToChannel(channel, (event: ClinicEvent) => {
        try {
          const sseMessage = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(sseMessage));
          // Also stream as default message event for standard onmessage listeners
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch (err) {
          console.error("Error streaming SSE event:", err);
        }
      });

      // Heartbeat every 20s
      heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`));
        } catch {
          if (heartbeatTimer) clearInterval(heartbeatTimer);
        }
      }, 20000);

      req.signal.addEventListener("abort", () => {
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        if (unsubscribe) unsubscribe();
        try {
          controller.close();
        } catch (e) {}
      });
    },
    cancel() {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (unsubscribe) unsubscribe();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}

// Allow POST to trigger broadcasts from client actions
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, payload, orgId, doctorId } = body;

    if (!type) {
      return Response.json({ error: "Event type is required" }, { status: 400 });
    }

    const event = eventBus.broadcast(type, payload ?? {}, orgId, doctorId);
    return Response.json({ success: true, event }, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message || "Failed to broadcast event" }, { status: 500 });
  }
}
