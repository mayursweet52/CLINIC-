import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listPatients, getPatient, createPatient } from './api';

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: listPatients,
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patient', id],
    queryFn: () => getPatient(id),
    enabled: !!id,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}
