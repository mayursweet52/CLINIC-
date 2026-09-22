import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodayAppointments, checkIn, cancelAppointment } from './api';

export function useTodayAppointments() {
  return useQuery({
    queryKey: ['reception-appointments-today'],
    queryFn: getTodayAppointments,
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reception-appointments-today'] });
    },
  });
}

export function useCancel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reception-appointments-today'] });
    },
  });
}
