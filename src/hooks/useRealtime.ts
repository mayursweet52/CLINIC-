'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { ClinicEvent } from '@/lib/events.types';

export interface RealtimeEvent<T = any> {
  id: string;
  type: string;
  orgId?: string;
  doctorId?: string;
  payload: T;
  timestamp: string;
}

export interface UseRealtimeOptions {
  orgId?: string;
  doctorId?: string;
  onEvent?: (event: RealtimeEvent) => void;
  enableChime?: boolean;
}

// Synthesize a clean hospital bell chime using Web Audio API
export function playHospitalChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    // Primary bell tone (880 Hz / A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.25, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    // Harmonic bell tone (1320 Hz / E6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.18, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 1.2);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 1.5);
  } catch (e) {
    // Audio context may be restricted before user gesture
  }
}

export function useRealtime(options: UseRealtimeOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCount = useRef(0);
  const listenersRef = useRef<Map<string, Set<(payload: any) => void>>>(new Map());

  const { orgId, doctorId, onEvent, enableChime = false } = options;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function connect() {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const params = new URLSearchParams();
      if (orgId) params.append('orgId', orgId);
      if (doctorId) params.append('doctorId', doctorId);

      const url = `/api/realtime?${params.toString()}`;
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
        retryCount.current = 0;
      };

      const handleEvent = (data: RealtimeEvent) => {
        setLastEvent(data);
        setEvents((prev) => [data, ...prev.slice(0, 49)]);

        if (enableChime) {
          playHospitalChime();
        }

        if (onEvent) {
          onEvent(data);
        }

        const typeListeners = listenersRef.current.get(data.type);
        if (typeListeners) {
          typeListeners.forEach((fn) => fn(data.payload));
        }
        const wildcardListeners = listenersRef.current.get('*');
        if (wildcardListeners) {
          wildcardListeners.forEach((fn) => fn(data));
        }
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleEvent(data);
        } catch (err) {
          // ignore keepalives
        }
      };

      const registeredTypes = [
        'appointment.created',
        'patient.checked_in',
        'queue.next',
        'prescription.ready',
        'prescription.dispensed',
        'bill.paid',
        'lab.report_ready'
      ];

      registeredTypes.forEach((eventType) => {
        es.addEventListener(eventType, (e: MessageEvent) => {
          try {
            const parsed: RealtimeEvent = JSON.parse(e.data);
            handleEvent(parsed);
          } catch (err) {
            console.error('Failed to parse SSE event', err);
          }
        });
      });

      es.onerror = () => {
        setIsConnected(false);
        es.close();

        const timeout = Math.min(10000, 1000 * Math.pow(2, retryCount.current));
        retryCount.current += 1;
        reconnectTimeoutRef.current = setTimeout(connect, timeout);
      };
    }

    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsConnected(false);
    };
  }, [orgId, doctorId, enableChime]);

  const emit = useCallback(async (type: string, payload: any) => {
    try {
      await fetch('/api/realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, payload, orgId, doctorId })
      });
    } catch (err) {
      console.error('Failed to broadcast realtime event:', err);
    }
  }, [orgId, doctorId]);

  const on = useCallback((type: string, callback: (payload: any) => void) => {
    if (!listenersRef.current.has(type)) {
      listenersRef.current.set(type, new Set());
    }
    listenersRef.current.get(type)!.add(callback);
    return () => {
      listenersRef.current.get(type)?.delete(callback);
    };
  }, []);

  return {
    isConnected,
    lastEvent,
    events,
    emit,
    on,
    playHospitalChime
  };
}
