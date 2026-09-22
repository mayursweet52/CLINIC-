export function paymentConfirmation(data: any) {
  return {
    subject: "Payment Confirmation",
    body: `Thank you for your payment of ${data.amount}.`,
  };
}
