import { HealthAppointment, Patient, User } from '@prisma/client';
export type ReceptionAppointment = HealthAppointment & { patient: Patient; doctor: User | null };
