export function billGenerated(data: any) {
  return {
    subject: "Bill Generated",
    body: `Your bill for ${data.amount} has been generated. Pay here: ${data.link}`,
  };
}
