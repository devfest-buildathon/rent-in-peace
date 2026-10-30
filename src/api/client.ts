/**
 * Base HTTP client for calling the Rent in Peace backend service.
 * Reads base URL from import.meta.env.VITE_API_BASE_URL.
 */

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/$/, "")

export class ApiError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiError(
      "Backend not connected yet. (VITE_API_BASE_URL is not configured).",
      0
    )
  }

  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`

  const headers = new Headers(options.headers || {})
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    })

    if (!res.ok) {
      let errorMsg = `Server returned ${res.status}: ${res.statusText}`
      try {
        const json = await res.json()
        if (json && (json.message || json.error)) {
          errorMsg = json.message || json.error
        }
      } catch {
        // use default errorMsg
      }
      throw new ApiError(errorMsg, res.status)
    }

    return (await res.json()) as T
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      throw err
    }
    // Network failures / fetch connection refused
    throw new ApiError(
      "Backend service is unreachable. Please verify your connection or backend server status.",
      0
    )
  }
}
