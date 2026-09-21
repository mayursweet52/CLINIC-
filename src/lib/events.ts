import Redis from "ioredis";
import { ClinicEvent } from "./events.types";
import logger from "./logger";

// Central Event Bus for Real-Time ClinicOS events
// Supports Redis Pub/Sub, SSE streaming, in-memory pub/sub, and persistent recent event replay

type Subscriber = (event: ClinicEvent) => void;

class EventBus {
  private subscribers: Set<Subscriber> = new Set();
  private history: ClinicEvent[] = [];
  private maxHistory = 100;

  constructor() {
    this.history.push({
      type: "system.ready" as any,
      payload: { id: "init-1", orgId: "global", message: "ClinicOS Real-Time Event Bus initialized" },
      timestamp: new Date().toISOString()
    });
  }

  subscribe(callback: Subscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  broadcast<T = any>(type: any, payload: T, orgId?: string, doctorId?: string): ClinicEvent {
    const event: ClinicEvent = {
      type,
      payload: {
        ...(typeof payload === 'object' && payload !== null ? payload : { data: payload }),
        id: (payload as any)?.id || `evt-${Date.now()}`,
        orgId: orgId || (payload as any)?.orgId || 'org-1',
        doctorId: doctorId || (payload as any)?.doctorId,
      },
      timestamp: new Date().toISOString()
    };

    // Store in history
    this.history.unshift(event);
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }

    // Notify all active in-memory subscribers
    for (const sub of this.subscribers) {
      try {
        sub(event);
      } catch (err) {
        logger.error({ err }, "Error notifying event subscriber");
      }
    }

    // Also publish to Redis if available
    const channel = orgId ? (doctorId ? `org:${orgId}:doctor:${doctorId}` : `org:${orgId}:appointments`) : `org:global`;
    publishEvent(channel, event).catch(() => {});

    return event;
  }

  getHistory(limit = 20, orgId?: string): ClinicEvent[] {
    if (!orgId) return this.history.slice(0, limit);
    return this.history
      .filter(e => !e.payload?.orgId || e.payload?.orgId === orgId)
      .slice(0, limit);
  }

  getSubscriberCount(): number {
    return this.subscribers.size;
  }
}

// Ensure singleton across HMR in Next.js development
const globalForEvents = globalThis as unknown as { __eventBus?: EventBus };
export const eventBus = globalForEvents.__eventBus ?? new EventBus();
if (process.env.NODE_ENV !== 'production') {
  globalForEvents.__eventBus = eventBus;
}

// Use environment variable or default local docker URL
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Global connection for publishing
let pubClient: Redis | null = null;
try {
  pubClient = new Redis(redisUrl, { retryStrategy: () => 2000, maxRetriesPerRequest: 1 });
  pubClient.on("error", (err) => {
    logger.warn("Redis pubClient error (using in-memory fallback): " + err.message);
  });
} catch (e) {
  logger.warn("Redis not available, operating in in-memory mode");
}

/**
 * Publishes an event to a specific Redis channel & in-memory event bus
 */
export async function publishEvent(channel: string, event: ClinicEvent) {
  try {
    if (pubClient && pubClient.status === "ready") {
      await pubClient.publish(channel, JSON.stringify(event));
    }
    logger.info({ channel, type: event.type }, "Event published");
  } catch (error) {
    logger.error({ error, channel, event }, "Failed to publish event to Redis");
  }
}

/**
 * Subscribes to a Redis channel and triggers a callback on message
 * Falls back to in-memory event bus
 */
export function subscribeToChannel(channel: string, onMessage: (event: ClinicEvent) => void) {
  // Subscribe to in-memory bus
  const unmem = eventBus.subscribe(onMessage);

  let subClient: Redis | null = null;
  try {
    subClient = new Redis(redisUrl, { retryStrategy: () => 2000, maxRetriesPerRequest: 1 });
    subClient.on("error", () => {});

    if (channel.includes("*")) {
      subClient.psubscribe(channel, () => {});
      subClient.on("pmessage", (pattern, ch, message) => {
        try {
          onMessage(JSON.parse(message));
        } catch (e) {}
      });
    } else {
      subClient.subscribe(channel, () => {});
      subClient.on("message", (ch, message) => {
        if (ch === channel) {
          try {
            onMessage(JSON.parse(message));
          } catch (e) {}
        }
      });
    }
  } catch (e) {}

  return () => {
    unmem();
    if (subClient) {
      try {
        subClient.quit();
      } catch (e) {}
    }
  };
}
