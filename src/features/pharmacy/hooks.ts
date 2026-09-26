import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPendingPrescriptions, getInventory, dispensePrescription } from "./api";
import { toast } from "sonner";

export const usePendingPrescriptions = () => {
  return useQuery({
    queryKey: ["prescriptions", "pending"],
    queryFn: getPendingPrescriptions,
  });
};

export const useInventory = () => {
  return useQuery({
    queryKey: ["inventory"],
    queryFn: getInventory,
  });
};

export const useDispense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: dispensePrescription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prescriptions", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Prescription dispensed successfully");
    }
  });
};

export const useAddMedicine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const { api } = await import('@/lib/api-client');
      const res = await api.post<any>('/pharmacy/inventory', data);
      return res?.data ?? res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Medicine added successfully");
    }
  });
};
