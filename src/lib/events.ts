import Redis from "ioredis";
import { ClinicEvent } from "./events.types";
import logger from "./logger";

// Use environment variable or default local docker URL
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

// Global connection for publishing to prevent connection leaks
const pubClient = new Redis(redisUrl);

pubClient.on("error", (err) => {
  logger.error("Redis PubClient Error", { error: err.message });
});

/**
 * Publishes an event to a specific Redis channel
 */
export async function publishEvent(channel: string, event: ClinicEvent) {
  try {
    await pubClient.publish(channel, JSON.stringify(event));
    logger.info("Event published", { channel, type: event.type });
  } catch (error) {
    logger.error("Failed to publish event", { error, channel, event });
  }
}

/**
 * Subscribes to a Redis channel and triggers a callback on message
 * Returns an unsubscribe function to properly cleanup connections
 */
export function subscribeToChannel(channel: string, onMessage: (event: ClinicEvent) => void) {
  const subClient = new Redis(redisUrl);
  
  subClient.on("error", (err) => {
    logger.error("Redis SubClient Error", { error: err.message, channel });
  });

  // Use psubscribe if channel has wildcards, otherwise subscribe
  if (channel.includes("*")) {
    subClient.psubscribe(channel, (err) => {
      if (err) logger.error("Failed to psubscribe", { error, channel });
    });
    
    subClient.on("pmessage", (pattern, ch, message) => {
      try {
        onMessage(JSON.parse(message));
      } catch(e) {
        logger.error("Error parsing event pmessage", { e, message });
      }
    });
  } else {
    subClient.subscribe(channel, (err) => {
      if (err) logger.error("Failed to subscribe", { error, channel });
    });

    subClient.on("message", (ch, message) => {
      if (ch === channel) {
        try {
          onMessage(JSON.parse(message));
        } catch(e) {
          logger.error("Error parsing event message", { e, message });
        }
      }
    });
  }

  // Return a cleanup function
  return () => {
    subClient.quit();
  };
}
