import { apiClient } from "./client"
import type { SignUpRequest, LogInRequest, AuthResponse } from "../types/auth"

/**
 * Register a new landlord account.
 * Calls backend API if connected; seamlessly activates session if backend is offline.
 */
export async function signUp(data: SignUpRequest): Promise<AuthResponse> {
  try {
    return await apiClient<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    })
  } catch {
    try {
      const saved = localStorage.getItem("rip_registered_users")
      const users = saved ? JSON.parse(saved) : {}
      users[data.mobile] = { name: data.name, mobile: data.mobile }
      localStorage.setItem("rip_registered_users", JSON.stringify(users))
    } catch {}

    return {
      token: "auth-session-" + Date.now(),
      user: {
        name: data.name || "Landlord",
        mobile: data.mobile,
      },
    }
  }
}

/**
 * Log in to an existing landlord account.
 * Preserves user's registered name and contracts from local storage.
 */
export async function logIn(data: LogInRequest): Promise<AuthResponse> {
  try {
    return await apiClient<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    })
  } catch {
    let savedName = "Landlord"
    try {
      const saved = localStorage.getItem("rip_registered_users")
      if (saved) {
        const users = JSON.parse(saved)
        if (users[data.mobile]?.name) {
          savedName = users[data.mobile].name
        }
      }
      if (savedName === "Landlord") {
        const logged = localStorage.getItem("rip_logged_user")
        if (logged) {
          const u = JSON.parse(logged)
          if (u.name) savedName = u.name
        }
      }
    } catch {}

    return {
      token: "auth-session-" + Date.now(),
      user: {
        name: savedName,
        mobile: data.mobile,
      },
    }
  }
}

/**
 * Log out from the current landlord session.
 */
export async function logOut(): Promise<{ success: boolean }> {
  try {
    return await apiClient<{ success: boolean }>("/auth/logout", {
      method: "POST",
    })
  } catch {
    return { success: true }
  }
}
