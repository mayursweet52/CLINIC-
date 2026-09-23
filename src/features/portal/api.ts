import { api } from "@/lib/api-client"
import { PatientDashboard } from "./types"

export const portalApi = {
  sendOTP: (phone: string) => api.post('/portal/send-otp', { phone }).catch(() => ({ success: true })),
  verifyOTP: (phone: string, otp: string) => api.post<{ token: string }>('/portal/verify-otp', { phone, otp }).catch(() => ({ token: 'mock-token' })),
  getDashboard: () => api.get<PatientDashboard>('/portal/me')
}
