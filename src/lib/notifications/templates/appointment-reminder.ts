export function appointmentReminder(data: any) {
  return {
    subject: "Appointment Reminder",
    body: `Reminder: You have an appointment tomorrow at ${data.time}.`,
  };
}
