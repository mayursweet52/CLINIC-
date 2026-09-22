import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { authApi } from "./api"
import { LoginInput } from "./types"
import { toast } from "sonner"

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: LoginInput) => authApi.login(data),
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data.user)
      toast.success("Logged in successfully")
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to login")
    }
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.clear()
      window.location.href = '/login'
    }
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => authApi.me(),
    retry: false,
  })
}
