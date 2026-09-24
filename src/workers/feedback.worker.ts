import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function runFeedbackWorker() {
  console.log("[Worker] Starting Feedback Request Worker...");

  try {
    // 24 hours ago
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    // 25 hours ago
    const oneDayAndOneHourAgo = new Date(Date.now() - 25 * 60 * 60 * 1000);

    const eligibleAppointments = await prisma.healthAppointment.findMany({
      where: {
        status: "COMPLETED",
        // We'll use appointmentDate to approximate completedAt for demo purposes
        appointmentDate: {
          gte: oneDayAndOneHourAgo,
          lte: oneDayAgo,
        },
        review: null, // No review exists
        billing: {
          paymentStatus: "PAID",
        }
      },
      include: {
        patient: true,
        doctor: true,
        organization: true,
      }
    });

    console.log(`[Worker] Found ${eligibleAppointments.length} appointments eligible for feedback.`);

    for (const appointment of eligibleAppointments) {
      const feedbackLink = `https://clinicos.in/feedback/${appointment.id}`;
      
      const message = `Hi ${appointment.patient.name.split(" ")[0]}, how was your visit with ${appointment.doctor.name}? Rate your experience here: ${feedbackLink}`;

      // In a real app, integrate Twilio/WhatsApp API here.
      // For now, log to NotificationLog
      await prisma.notificationLog.create({
        data: {
          organizationId: appointment.organizationId,
          type: "SMS",
          recipient: appointment.patient.phone,
          title: "Feedback Request",
          message: message,
          status: "SENT",
        }
      });

      console.log(`[Worker] Sent feedback SMS to ${appointment.patient.phone} for appointment ${appointment.id}`);
    }

  } catch (error) {
    console.error("[Worker] Error:", error);
  } finally {
    await prisma.$disconnect();
    console.log("[Worker] Finished Feedback Request Worker.");
  }
}

// Run immediately if called directly
if (require.main === module) {
  runFeedbackWorker();
}
