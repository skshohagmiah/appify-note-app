import { useMutation, useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import type { LoginRequest, RegisterRequest, LoginResponse, User } from "@/lib/api/types"

const AUTH_QUERY_KEY = "auth"

export function useLogin() {
  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiClient.post<{ success: boolean, data: LoginResponse }>("/auth/login", data)
      if (response.data.data.token) {
        localStorage.setItem("authToken", response.data.data.token)
      }
      return response.data.data
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await apiClient.post<{ success: boolean, data: LoginResponse }>("/auth/register", data)
      if (response.data.data.token) {
        localStorage.setItem("authToken", response.data.data.token)
      }
      return response.data.data
    },
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: [AUTH_QUERY_KEY, "me"],
    queryFn: async () => {
      const response = await apiClient.get<{ data: User }>("/auth/me")
      return response.data.data
    },
    retry: false,
  })
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout")
      localStorage.removeItem("authToken")
    },
  })
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await apiClient.post("/auth/forgot-password", { email })
      return response.data
    },
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const response = await apiClient.post("/auth/reset-password", data)
      return response.data
    },
  })
}
