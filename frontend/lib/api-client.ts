import axios, { type AxiosInstance, type AxiosError } from "axios"

export const createApiClient = (
  baseURL: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
): AxiosInstance => {
  const client = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  })

  // Request interceptor to add auth token
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem("authToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Token expired, try to refresh
        localStorage.removeItem("authToken")
        window.location.href = "/login"
      }
      return Promise.reject(error)
    },
  )

  return client
}

export const apiClient = createApiClient()
