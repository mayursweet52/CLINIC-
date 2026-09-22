import { Worker, Job } from "bullmq";
import { subscribeToChannel } from "../lib/events";
import { emailQueue, smsQueue, whatsappQueue } from "../lib/queue";
import { dispatch } from "../lib/notifications/index";
import { prisma } from "../lib/prisma";
import logger from "../lib/logger";

const connection = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
};
// If REDIS_URL is provided, we can parse it or just use ioredis directly.
// The queue.ts uses process.env.REDIS_URL, so let's import the same connection approach or just pass redisUrl.
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
import Redis from "ioredis";

// Use a shared bullmq connection logic
const createWorkerConnection = () => new Redis(redisUrl, { maxRetriesPerRequest: null });

subscribeToChannel("*", async (event) => {
  try {
    const type = event.type;
    const payload = event.payload as any;
    
    if (!payload) return;

    if (type === "appointment.created") {
      const apt = await prisma.healthAppointment.findUnique({
        where: { id: payload.appointmentId || payload.id },
        include: { patient: true },
      });
      if (apt?.patient?.phone) {
        const data = {
          date: apt.appointmentDate.toISOString().split("T")[0],
          time: apt.timeSlot,
        };
        const jobOpts = { attempts: 3, backoff: { type: "exponential", delay: 1000 } };
        
        await smsQueue.add("send", {
          orgId: apt.organizationId,
          to: apt.patient.phone,
          templateName: "bookingConfirmation",
          data,
        }, jobOpts);
        
        await whatsappQueue.add("send", {
          orgId: apt.organizationId,
          to: apt.patient.phone,
          templateName: "bookingConfirmation",
          data,
        }, jobOpts);
      }
    } 
    else if (type === "patient.checked_in") {
      const apt = await prisma.healthAppointment.findUnique({
        where: { id: payload.appointmentId || payload.id },
        include: { doctor: true, patient: true },
      });
      if (apt?.doctor?.email) {
        await emailQueue.add("send", {
          orgId: apt.organizationId,
          to: apt.doctor.email,
          templateName: "appointmentReminder", // Or whatever fits
          data: { time: "now", name: apt.patient.name }
        }, { attempts: 3, backoff: { type: "exponential", delay: 1000 } });
      }
    }
    else if (type === "prescription.created") {
      const rx = await prisma.prescription.findUnique({
        where: { id: payload.prescriptionId || payload.id },
        include: { patient: true },
      });
      if (rx?.patient?.phone) {
        await smsQueue.add("send", {
          orgId: rx.organizationId,
          to: rx.patient.phone,
          templateName: "prescriptionReady",
          data: {}
        }, { attempts: 3, backoff: { type: "exponential", delay: 1000 } });
      }
    }
    else if (type === "bill.generated") {
      const bill = await prisma.billing.findUnique({
        where: { id: payload.billId || payload.id },
        include: { appointment: { include: { patient: true } } },
      });
      if (bill?.appointment?.patient?.phone) {
        await whatsappQueue.add("send", {
          orgId: bill.organizationId,
          to: bill.appointment.patient.phone,
          templateName: "billGenerated",
          data: { amount: bill.totalAmount, link: `https://example.com/pay/${bill.id}` }
        }, { attempts: 3, backoff: { type: "exponential", delay: 1000 } });
      }
    }
    else if (type === "bill.paid") {
      const bill = await prisma.billing.findUnique({
        where: { id: payload.billId || payload.id },
        include: { appointment: { include: { patient: true } } },
      });
      if (bill?.appointment?.patient?.email) {
        await emailQueue.add("send", {
          orgId: bill.organizationId,
          to: bill.appointment.patient.email,
          templateName: "paymentConfirmation",
          data: { amount: bill.totalAmount }
        }, { attempts: 3, backoff: { type: "exponential", delay: 1000 } });
      }
    }
  } catch (err) {
    logger.error("Error processing event for notification worker", err);
  }
});

const processJob = (channel: "email" | "sms" | "whatsapp") => async (job: Job) => {
  return await dispatch(channel, job.data);
};

// Create Workers
const emailWorker = new Worker("email", processJob("email"), { connection: createWorkerConnection() });
const smsWorker = new Worker("sms", processJob("sms"), { connection: createWorkerConnection() });
const whatsappWorker = new Worker("whatsapp", processJob("whatsapp"), { connection: createWorkerConnection() });

[emailWorker, smsWorker, whatsappWorker].forEach(worker => {
  worker.on("failed", (job, err) => {
    logger.error(`Job failed for ${worker.name}: ${err.message}`);
  });
});

logger.info("Notification Worker started, listening to events and queues.");
