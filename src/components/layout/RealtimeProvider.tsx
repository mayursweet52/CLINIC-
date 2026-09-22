"use client"
import { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react"
import { toast } from "sonner"

interface RealtimeContextType {
  isConnected: boolean
  lastEvent: any
  subscribe: (channel: string) => void
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<any>(null)
  const retryCount = useRef(0)
  const maxRetryTime = 30000

  useEffect(() => {
    let eventSource: EventSource | null = null
    let retryTimeout: NodeJS.Timeout

    const connect = () => {
      eventSource = new EventSource('/api/realtime')

      eventSource.onopen = () => {
        setIsConnected(true)
        retryCount.current = 0
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          setLastEvent(data)
        } catch (e) {
          console.error("Failed to parse realtime event", e)
        }
      }

      eventSource.onerror = () => {
        setIsConnected(false)
        eventSource?.close()
        
        const nextRetry = Math.min(1000 * Math.pow(2, retryCount.current), maxRetryTime)
        retryCount.current += 1
        
        if (retryCount.current === 1) {
          toast.error("Live connection lost. Reconnecting...")
        }

        retryTimeout = setTimeout(connect, nextRetry)
      }
    }

    connect()

    return () => {
      clearTimeout(retryTimeout)
      eventSource?.close()
    }
  }, [])

  const subscribe = (channel: string) => {
    // Basic subscription stub
    console.log(`Subscribed to ${channel}`)
  }

  return (
    <RealtimeContext.Provider value={{ isConnected, lastEvent, subscribe }}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (context === undefined) {
    throw new Error("useRealtime must be used within a RealtimeProvider")
  }
  return context
}
