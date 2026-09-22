import { Queue } from "bullmq";
import Redis from "ioredis";
import logger from "./logger";

// Create a BullMQ-compatible Redis connection
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const connection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,
});

connection.on("error", (err) => {
  logger.warn("Redis Queue Connection Error: " + err.message);
});

// BullMQ Queue instances
export const emailQueue = new Queue("email", { connection });
export const smsQueue = new Queue("sms", { connection });
export const whatsappQueue = new Queue("whatsapp", { connection });

// Graceful shutdown
export const closeQueues = async () => {
  await emailQueue.close();
  await smsQueue.close();
  await whatsappQueue.close();
  connection.disconnect();
};

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down queues...");
  await closeQueues();
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down queues...");
  await closeQueues();
});
