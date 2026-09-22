import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodaySchedule, getStats, completeConsultation } from './api';

export function useTodaySchedule() {
  return useQuery({
    queryKey: ['doctor-schedule-today'],
    queryFn: getTodaySchedule,
  });
}

export function useDoctorStats() {
  return useQuery({
    queryKey: ['doctor-stats'],
    queryFn: getStats,
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
