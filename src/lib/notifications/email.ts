import { Resend } from 'resend';

export async function sendEmail({
  to,
  subject,
  template,
  data,
  attachments,
}: {
  to: string;
  subject?: string;
  template: string;
  data: any;
  attachments?: { filename: string; path: string }[];
}) {
  const resend = new Resend(process.env.RESEND_API_KEY || 're_123');

  // Since we have attachment paths, we need to read them or pass them to resend.
  // resend attachments accepts content (Buffer) or path.
  // We can just pass the path.

  const res = await resend.emails.send({
    from: 'onboarding@resend.dev', // Use a default from address
    to,
    subject: subject || 'Notification',
    text: JSON.stringify(data, null, 2), // Fallback text
    attachments: attachments?.map(att => ({
      filename: att.filename,
      path: att.path,
    })),
  });

  if (res.error) {
    throw new Error(res.error.message);
  }

  return { success: true };
}
