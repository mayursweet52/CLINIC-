export async function sendWhatsApp({
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
