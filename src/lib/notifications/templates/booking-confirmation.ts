export function bookingConfirmation(data: any) {
  return {
    subject: "Booking Confirmation",
    body: `Your appointment is confirmed for ${data.date} at ${data.time}.`,
  };
}
