"use client";

import { useEffect, useState, useRef } from "react";
import { ClinicEvent } from "@/lib/events.types";
import { toast } from "sonner";

export function useRealtime() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<ClinicEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCount = useRef(0);

  useEffect(() => {
    function connect() {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = new EventSource("/api/realtime");
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
        retryCount.current = 0; // reset backoff on success
      };

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as ClinicEvent;
          setLastEvent(data);
        } catch (err) {
          console.error("Failed to parse SSE message", err);
        }
      };

      es.addEventListener("connected", (event) => {
        console.log("Realtime connected:", event.data);
      });

      es.addEventListener("heartbeat", () => {
        // Just keeping the connection alive
      });

      es.onerror = (error) => {
        setIsConnected(false);
        es.close();
        
        // Exponential backoff reconnect
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
      }
    };
  }, []);

  return { isConnected, lastEvent };
}
