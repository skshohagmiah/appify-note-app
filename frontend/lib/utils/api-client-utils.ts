import { AxiosError } from "axios"

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response?.data?.message) {
      return error.response.data.message
    }
    if (error.response?.status === 401) {
      return "Authentication failed. Please sign in again."
    }
    if (error.response?.status === 403) {
      return "You don't have permission to perform this action."
    }
    if (error.response?.status === 404) {
      return "Resource not found."
    }
    if (error.response?.status === 500) {
      return "Server error. Please try again later."
    }
    return error.message || "An error occurred"
  }

  if (error instanceof Error) {
    return error.message
  }

  return "An unknown error occurred"
}

export function isAuthError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 401 || error.response?.status === 403
  }
  return false
}

export function handleApiError(error: unknown): void {
  const message = getErrorMessage(error)
  console.error("[v0] API Error:", message)

  if (isAuthError(error)) {
    localStorage.removeItem("authToken")
    window.location.href = "/login"
  }
}
