import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodaySchedule, getStats, completeConsultation } from './api';

export function useTodaySchedule(doctorId?: string) {
  return useQuery({
    queryKey: ['doctor-schedule-today', doctorId],
    queryFn: () => getTodaySchedule(doctorId),
  });
}

export function useDoctorStats(doctorId?: string) {
  return useQuery({
    queryKey: ['doctor-stats', doctorId],
    queryFn: () => getStats(doctorId),
  });
}

export function useCompleteConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: completeConsultation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-schedule-today'] });
      queryClient.invalidateQueries({ queryKey: ['doctor-stats'] });
    },
  });
}
