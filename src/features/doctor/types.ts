import { HealthAppointment, Patient, User } from '@prisma/client';

export type DoctorAppointment = HealthAppointment & { 
  patient: Patient; 
  doctor: User | null;
};
