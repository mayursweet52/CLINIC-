import { api } from "@/lib/api-client"
import { PatientDashboard } from "./types"

export const portalApi = {
  sendOTP: (phone: string) => api.post('/portal/send-otp', { phone }).catch(() => ({ success: true })),
  verifyOTP: (phone: string, otp: string) => api.post<{ token: string }>('/portal/verify-otp', { phone, otp }).catch(() => ({ token: 'mock-token' })),
  getDashboard: () => api.get<PatientDashboard>('/portal/me').catch(() => ({
    id: 'p1',
    name: 'Rahul Sharma',
    avatar: 'https://i.pravatar.cc/150?u=rahul',
    upcomingAppointment: {
      id: 'a1',
      doctorName: 'Dr. Sarah Smith',
      specialty: 'Cardiology',
      date: '2024-10-25',
      time: '10:30 AM',
      status: 'CONFIRMED'
    },
    recentPrescriptions: [
      { id: 'rx1', date: '2024-10-15', doctorName: 'Dr. John Doe', medicines: 3 }
    ],
    pendingBills: [
      { id: 'b1', amount: 1500, date: '2024-10-15' }
    ]
  }))
}
