import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBills, getBill, markBillPaid } from "./api";
import { toast } from "sonner";

export const useBills = () => {
  return useQuery({
    queryKey: ["bills"],
    queryFn: getBills,
  });
};

export const useBill = (id: string) => {
  return useQuery({
    queryKey: ["bill", id],
    queryFn: () => getBill(id),
  });
};

export const useMarkPaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markBillPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      queryClient.invalidateQueries({ queryKey: ["bill"] });
      toast.success("Bill marked as paid");
    },
    onError: () => {
      toast.error("Failed to mark bill as paid");
    }
  });
};
