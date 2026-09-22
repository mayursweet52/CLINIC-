import { z } from "zod"

export const BookingSchema = z.object({
  departmentId: z.string().min(1, "Department is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  date: z.string().min(1, "Date is required"),
  timeSlot: z.string().min(1, "Time slot is required"),
  patientName: z.string().min(2, "Name must be at least 2 characters"),
  patientPhone: z.string().regex(/^\+91[0-9]{10}$/, "Invalid phone number"),
  reason: z.string().optional(),
})

export type BookingInput = z.infer<typeof BookingSchema>

export interface Department {
  id: string
  name: string
  description?: string
  icon?: string
}

export interface Doctor {
  id: string
  name: string
  specialty: string
  consultationFee: number
  avatar?: string
}

export interface TimeSlot {
  time: string
  available: boolean
}

export interface BookingResponse {
  tokenNumber: string
  appointmentId: string
}
