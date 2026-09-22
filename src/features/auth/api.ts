import { api } from "@/lib/api-client"
import { LoginInput, User } from "./types"

export const authApi = {
  login: (data: LoginInput) => api.post<{ token: string; user: User }>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get<User>('/portal/me'), // Use existing endpoint or standard
}
