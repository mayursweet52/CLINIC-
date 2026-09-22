import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAvailability, createSlot, deleteSlot, getTimeOff, markLeave, deleteLeave } from "./api";
import { toast } from "sonner";

export const useAvailability = () => useQuery({ queryKey: ["availability"], queryFn: getAvailability });
export const useTimeOff = () => useQuery({ queryKey: ["timeOff"], queryFn: getTimeOff });

export const useCreateSlot = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSlot,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["availability"] }); toast.success("Slot added"); }
  });
};

export const useMarkLeave = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markLeave,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["timeOff"] }); toast.success("Leave marked"); }
  });
};
