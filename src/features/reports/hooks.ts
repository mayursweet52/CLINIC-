import { useQuery } from "@tanstack/react-query";
import { getAnalytics } from "./api";

export const useAnalytics = (range: string) => {
  return useQuery({
    queryKey: ["analytics", range],
    queryFn: () => getAnalytics(range),
  });
};
