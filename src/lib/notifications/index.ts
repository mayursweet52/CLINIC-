import prisma from "../prisma";
import { sendEmail } from "./email";
import { sendSMS } from "./sms";
import { sendWhatsApp } from "./whatsapp";
import * as templates from "./templates";

type Channel = "email" | "sms" | "whatsapp";

interface NotificationPayload {
  orgId: string;
  to: string;
  templateName: string;
  data: any;
}

export async function dispatch(channel: Channel, payload: NotificationPayload) {
  const isDev = process.env.NODE_ENV !== "production";

  // Build the message from template
  const templateFn = (templates as any)[payload.templateName];
  if (!templateFn) {
    throw new Error(`Template ${payload.templateName} not found`);
  }
  
  const content = templateFn(payload.data);

  if (isDev) {
    console.log(
      `[DEV-NOTIFICATION] ${channel.toUpperCase()} to ${payload.to}:`,
      content
    );
  }

  // Record to DB as PENDING
  const log = await prisma.notificationLog.create({
    data: {
      orgId: payload.orgId,
      channel,
      to: payload.to,
      template: payload.templateName,
      payload: payload.data,
      status: "PENDING",
    },
  });

  try {
    if (!isDev) {
      if (channel === "email") {
        await sendEmail({
          to: payload.to,
          subject: content.subject,
          template: payload.templateName,
          data: payload.data,
          attachments: payload.data?.attachments,
        });
      } else if (channel === "sms") {
        await sendSMS({
          to: payload.to,
          template: payload.templateName,
          data: payload.data,
        });
      } else if (channel === "whatsapp") {
        await sendWhatsApp({
          to: payload.to,
          template: payload.templateName,
          data: payload.data,
        });
      }
    }

    // Mark as SENT
    await prisma.notificationLog.update({
      where: { id: log.id },
      data: {
        status: "SENT",
        sentAt: new Date(),
      },
    });

    return true;
  } catch (error: any) {
    // Mark as FAILED
    await prisma.notificationLog.update({
      where: { id: log.id },
      data: {
        status: "FAILED",
        error: error.message || "Unknown error",
      },
    });
    throw error;
  }
}
