export type EventName = 
  | "appointment.created" 
  | "appointment.updated" 
  | "appointment.cancelled"
  | "patient.checked_in"
  | "prescription.created"
  | "bill.paid";

export interface EventPayload {
  id: string;
  orgId: string;
  [key: string]: any;
}

export interface ClinicEvent {
  type: EventName;
  payload: EventPayload;
  timestamp: string;
}
