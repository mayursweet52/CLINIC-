// Central Event Bus for Real-Time ClinicOS events
// Supports SSE streaming, in-memory pub/sub, and persistent recent event replay

export interface ClinicEvent<T = any> {
  id: string;
  type: string;
  orgId?: string;
  doctorId?: string;
  payload: T;
  timestamp: string;
}

type Subscriber = (event: ClinicEvent) => void;

class EventBus {
  private subscribers: Set<Subscriber> = new Set();
  private history: ClinicEvent[] = [];
  private maxHistory = 100;

  constructor() {
    // Initial sample event
    this.history.push({
      id: 'init-1',
      type: 'system.ready',
      payload: { message: 'ClinicOS Real-Time Event Bus initialized' },
      timestamp: new Date().toISOString()
    });
  }

  subscribe(callback: Subscriber): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  broadcast<T = any>(type: string, payload: T, orgId?: string, doctorId?: string): ClinicEvent<T> {
    const event: ClinicEvent<T> = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      orgId,
      doctorId,
      payload,
      timestamp: new Date().toISOString()
    };

    // Store in history
    this.history.unshift(event);
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }

    // Notify all active subscribers
    for (const sub of this.subscribers) {
      try {
        sub(event);
      } catch (err) {
        console.error('Error notifying event subscriber:', err);
      }
    }

    return event;
  }

  getHistory(limit = 20, orgId?: string): ClinicEvent[] {
    if (!orgId) return this.history.slice(0, limit);
    return this.history
      .filter(e => !e.orgId || e.orgId === orgId)
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
