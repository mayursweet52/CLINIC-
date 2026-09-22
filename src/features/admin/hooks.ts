import { useQuery } from "@tanstack/react-query";
import { getOverview } from "./api";

export const useAdminOverview = () => {
  return useQuery({
    queryKey: ["admin-overview"],
    queryFn: getOverview,
  });
};
