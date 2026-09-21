import { NextRequest } from 'next/server';
import { eventBus } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get('orgId') || undefined;
  const doctorId = searchParams.get('doctorId') || undefined;

  const encoder = new TextEncoder();

  let unsubscribe: (() => void) | null = null;
  let heartbeatTimer: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection packet
      const initData = JSON.stringify({
        connected: true,
        timestamp: new Date().toISOString(),
        activeSubscribers: eventBus.getSubscriberCount() + 1,
        recentEvents: eventBus.getHistory(5, orgId)
      });
      controller.enqueue(encoder.encode(`event: connected\ndata: ${initData}\n\n`));

      // Subscribe to real-time events
      unsubscribe = eventBus.subscribe((event) => {
        // Filter by organization if specified
        if (orgId && event.orgId && event.orgId !== orgId) {
          return;
        }
        // Filter by doctor if doctor-specific event
        if (doctorId && event.doctorId && event.doctorId !== doctorId) {
          return;
        }

        try {
          const sseMessage = `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(sseMessage));
        } catch (err) {
          console.error('Error streaming SSE event:', err);
        }
      });

      // Keepalive heartbeat every 15 seconds
      heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keepalive ${Date.now()}\n\n`));
        } catch {
          if (heartbeatTimer) clearInterval(heartbeatTimer);
        }
      }, 15000);
    },
    cancel() {
      if (unsubscribe) unsubscribe();
      if (heartbeatTimer) clearInterval(heartbeatTimer);
    }
  });

  // Handle client disconnect via AbortSignal
  req.signal.addEventListener('abort', () => {
    if (unsubscribe) unsubscribe();
    if (heartbeatTimer) clearInterval(heartbeatTimer);
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  });
}

// Allow POST to trigger broadcasts from client actions
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, payload, orgId, doctorId } = body;

    if (!type) {
      return Response.json({ error: 'Event type is required' }, { status: 400 });
    }

    const event = eventBus.broadcast(type, payload ?? {}, orgId, doctorId);
    return Response.json({ success: true, event }, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err.message || 'Failed to broadcast event' }, { status: 500 });
  }
}
