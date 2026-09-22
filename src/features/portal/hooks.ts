import { useMutation, useQuery } from "@tanstack/react-query"
import { portalApi } from "./api"
import { toast } from "sonner"

export function useSendOTP() {
  return useMutation({
    mutationFn: (phone: string) => portalApi.sendOTP(phone),
    onSuccess: () => toast.success("OTP sent successfully!"),
    onError: () => toast.error("Failed to send OTP")
  })
}

export function useVerifyOTP() {
  return useMutation({
    mutationFn: ({ phone, otp }: { phone: string, otp: string }) => portalApi.verifyOTP(phone, otp),
    onSuccess: () => toast.success("Verified successfully!"),
    onError: () => toast.error("Invalid OTP")
  })
}

export function usePatientDashboard() {
  return useQuery({
    queryKey: ['portal', 'dashboard'],
    queryFn: () => portalApi.getDashboard()
  })
}
