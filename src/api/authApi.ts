import { apiClient } from "./client"
import type { SignUpRequest, LogInRequest, AuthResponse } from "../types/auth"

/**
 * Register a new landlord account.
 * Tenants have no accounts.
 */
export async function signUp(data: SignUpRequest): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

/**
 * Log in to an existing landlord account.
 */
export async function logIn(data: LogInRequest): Promise<AuthResponse> {
  return apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

/**
 * Log out from the current landlord session.
 */
export async function logOut(): Promise<{ success: boolean }> {
  return apiClient<{ success: boolean }>("/auth/logout", {
    method: "POST",
  })
}

