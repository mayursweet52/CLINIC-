export function prescriptionReady(data: any) {
  return {
    subject: "Prescription Ready",
    body: `Your prescription is ready for pickup.`,
  };
}
