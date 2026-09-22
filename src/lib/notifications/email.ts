export async function sendEmail({
  to,
  subject,
  template,
  data,
}: {
  to: string;
  subject?: string;
  template: string;
  data: any;
}) {
  // We'll implement actual sending logic later.
  // The dispatch function handles dev vs production.
  return { success: true };
}
