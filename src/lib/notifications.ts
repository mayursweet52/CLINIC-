// Patient Notification Simulator (WhatsApp & SMS)

import { auditService } from './audit';
import logger from './logger';

export interface NotificationPayload {
  id: string;
  recipientPhone: string;
  patientName: string;
  channel: 'WHATSAPP' | 'SMS';
  template: 'APPOINTMENT_CONFIRM' | 'MEDICINE_READY' | 'INVOICE_RECEIPT';
  message: string;
  timestamp: string;
  status: 'SENT' | 'DELIVERED';
}

class NotificationService {
  private history: NotificationPayload[] = [];

  send(options: {
    recipientPhone: string;
    patientName: string;
    channel?: 'WHATSAPP' | 'SMS';
    template: 'APPOINTMENT_CONFIRM' | 'MEDICINE_READY' | 'INVOICE_RECEIPT';
    data: Record<string, any>;
  }): NotificationPayload {
    const { recipientPhone, patientName, channel = 'WHATSAPP', template, data } = options;

    let message = '';
    if (template === 'APPOINTMENT_CONFIRM') {
      message = `🏥 *${data.hospitalName || 'City Care Hospital'}*\n\nNamaste ${patientName},\nYour appointment with *${data.doctorName || 'Doctor'}* is confirmed!\n\n🎟️ *Token Number:* #${data.tokenNumber}\n📅 *Date:* ${data.date || 'Today'}\n⏰ *Slot:* ${data.timeSlot || '10:00 AM'}\n\nPlease reach 10 mins prior. View digital slip: https://clinic.os/health?token=${data.tokenNumber}`;
    } else if (template === 'MEDICINE_READY') {
      message = `💊 *${data.hospitalName || 'City Care Hospital'} Pharmacy*\n\nHello ${patientName},\nYour prescription medicines are packed & ready for collection at Counter 2.\nTotal items: ${data.itemCount || 1}`;
    } else {
      message = `🧾 *Invoice Receipt - ${data.hospitalName || 'City Care Hospital'}*\n\nDear ${patientName},\nPayment of ₹${data.amount} via ${data.paymentMethod || 'UPI'} is received.\nInvoice #${data.invoiceNo}. Thank you!`;
    }

    const payload: NotificationPayload = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      recipientPhone,
      patientName,
      channel,
      template,
      message,
      timestamp: new Date().toISOString(),
      status: 'DELIVERED'
    };

    this.history.unshift(payload);
    logger.info(`[${channel} SIMULATOR] Sent to ${recipientPhone}: ${message.replace(/\n/g, ' ')}`);

    auditService.log({
      actor: 'NotificationService',
      role: 'SYSTEM',
      action: `${channel}_NOTIFICATION_SENT`,
      resource: 'Notification',
      resourceId: payload.id,
      details: { recipientPhone, template },
      status: 'SUCCESS'
    });

    return payload;
  }

  getHistory(limit = 20): NotificationPayload[] {
    return this.history.slice(0, limit);
  }
}

const globalForNotif = globalThis as unknown as { __notificationService?: NotificationService };
export const notificationService = globalForNotif.__notificationService ?? new NotificationService();
if (process.env.NODE_ENV !== 'production') {
  globalForNotif.__notificationService = notificationService;
}
