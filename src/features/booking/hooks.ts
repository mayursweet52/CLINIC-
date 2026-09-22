import { useMutation, useQuery } from "@tanstack/react-query"
import { bookingApi } from "./api"
import { BookingInput } from "./types"

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => bookingApi.getDepartments(),
  })
}

export function useDoctors(departmentId: string) {
  return useQuery({
    queryKey: ['doctors', departmentId],
    queryFn: () => bookingApi.getDoctors(departmentId),
    enabled: !!departmentId,
  })
}

export function useSlots(doctorId: string, date: string) {
  return useQuery({
    queryKey: ['slots', doctorId, date],
    queryFn: () => bookingApi.getSlots(doctorId, date),
    enabled: !!doctorId && !!date,
  })
}

export function useBookAppointment() {
  return useMutation({
    mutationFn: (data: BookingInput) => bookingApi.bookAppointment(data),
  })
}
