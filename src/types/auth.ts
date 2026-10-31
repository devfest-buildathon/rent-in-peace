import type { UserProfile } from "./user"

export interface SignUpRequest {
  name: string
  mobile: string
  password: string
}

export interface LogInRequest {
  mobile: string
  password: string
  remember?: boolean
}

export interface AuthResponse {
  token: string
  user: UserProfile
}

