export async function sendSMS({
  to,
  template,
  data,
}: {
  to: string;
  template: string;
  data: any;
}) {
  return { success: true };
}
