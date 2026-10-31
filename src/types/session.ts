import type { UserProfile } from "./user"

export type UserRole = "landlord" | "tenant" | null

export interface SessionState {
  role: UserRole
  user: UserProfile | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
