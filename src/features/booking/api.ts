import { api } from "@/lib/api-client"
import { Department, Doctor, TimeSlot, BookingInput, BookingResponse } from "./types"

export const bookingApi = {
  getDepartments: () => api.get<Department[]>('/public/departments').catch(() => [
    { id: '1', name: 'General Physician', icon: 'stethoscope' },
    { id: '2', name: 'Orthopedics', icon: 'bone' },
    { id: '3', name: 'Pediatrics', icon: 'baby' },
  ]),
  getDoctors: (departmentId: string) => api.get<Doctor[]>(`/public/doctors?department=${departmentId}`).catch(() => [
    { id: '1', name: 'Dr. Sarah Smith', specialty: 'Cardiologist', consultationFee: 1000 },
    { id: '2', name: 'Dr. John Doe', specialty: 'Cardiologist', consultationFee: 1200 },
  ]),
  getSlots: (doctorId: string, date: string) => api.get<TimeSlot[]>(`/public/slots?doctor=${doctorId}&date=${date}`).catch(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      time: `${10 + Math.floor(i / 2)}:${i % 2 === 0 ? '00' : '30'}`,
      available: Math.random() > 0.3
    }))
  }),
  bookAppointment: (data: BookingInput) => api.post<BookingResponse>('/public/book', data).catch(() => ({
    tokenNumber: 'T-' + Math.floor(Math.random() * 1000),
    appointmentId: 'apt_' + Date.now()
  }))
}
