import { useState, useCallback } from "react"
import { signUp as apiSignUp, logIn as apiLogIn, logOut as apiLogOut } from "../api/authApi"
import type { UserProfile } from "../types/user"
import type { SignUpRequest, LogInRequest } from "../types/auth"
import type { UserRole, SessionState } from "../types/session"

const STORAGE_KEY_TOKEN = "rip_auth_token"
const STORAGE_KEY_USER = "rip_auth_user"
const STORAGE_KEY_ROLE = "rip_active_role"

function loadInitialState(): Pick<SessionState, "role" | "user" | "token"> {
  try {
    const role = (sessionStorage.getItem(STORAGE_KEY_ROLE) || localStorage.getItem(STORAGE_KEY_ROLE)) as UserRole
    const token = sessionStorage.getItem(STORAGE_KEY_TOKEN) || localStorage.getItem(STORAGE_KEY_TOKEN)
    const savedUser = sessionStorage.getItem(STORAGE_KEY_USER) || localStorage.getItem(STORAGE_KEY_USER)
    const user = savedUser ? (JSON.parse(savedUser) as UserProfile) : null

    return {
      role: role || null,
      token: token || null,
      user: user || null,
    }
  } catch {
    return { role: null, token: null, user: null }
  }
}

export function useSession() {
  const [initial] = useState(loadInitialState)
  const [role, setRoleState] = useState<UserRole>(initial.role)
  const [user, setUser] = useState<UserProfile | null>(initial.user)
  const [token, setToken] = useState<string | null>(initial.token)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole)
    try {
      if (newRole) {
        sessionStorage.setItem(STORAGE_KEY_ROLE, newRole)
      } else {
        sessionStorage.removeItem(STORAGE_KEY_ROLE)
        localStorage.removeItem(STORAGE_KEY_ROLE)
      }
    } catch {
      // ignore storage access errors
    }
  }, [])

  const login = useCallback(async (req: LogInRequest): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiLogIn(req)
      setToken(res.token)
      setUser(res.user)
      setRoleState("landlord")

      const storage = req.remember ? localStorage : sessionStorage
      try {
        storage.setItem(STORAGE_KEY_TOKEN, res.token)
        storage.setItem(STORAGE_KEY_USER, JSON.stringify(res.user))
        storage.setItem(STORAGE_KEY_ROLE, "landlord")
      } catch {
        // ignore storage errors
      }

      setIsLoading(false)
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to sign in. Please try again."
      setError(message)
      setIsLoading(false)
      return { success: false, error: message }
    }
  }, [])

  const register = useCallback(async (req: SignUpRequest): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await apiSignUp(req)
      setToken(res.token)
      setUser(res.user)
      setRoleState("landlord")

      try {
        sessionStorage.setItem(STORAGE_KEY_TOKEN, res.token)
        sessionStorage.setItem(STORAGE_KEY_USER, JSON.stringify(res.user))
        sessionStorage.setItem(STORAGE_KEY_ROLE, "landlord")
      } catch {
        // ignore storage errors
      }

      setIsLoading(false)
      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to create account. Please try again."
      setError(message)
      setIsLoading(false)
      return { success: false, error: message }
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    try {
      await apiLogOut()
    } catch {
      // Proceed with local logout regardless of network status
    } finally {
      setToken(null)
      setUser(null)
      setRoleState(null)
      setError(null)
      try {
        sessionStorage.removeItem(STORAGE_KEY_TOKEN)
        sessionStorage.removeItem(STORAGE_KEY_USER)
        sessionStorage.removeItem(STORAGE_KEY_ROLE)
        localStorage.removeItem(STORAGE_KEY_TOKEN)
        localStorage.removeItem(STORAGE_KEY_USER)
        localStorage.removeItem(STORAGE_KEY_ROLE)
      } catch {
        // ignore
      }
      setIsLoading(false)
    }
  }, [])

  const isAuthenticated = !!token && !!user && role === "landlord"

  return {
    role,
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    clearError,
    setRole,
    login,
    register,
    logout,
  }
}
