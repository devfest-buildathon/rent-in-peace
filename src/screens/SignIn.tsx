import { useState, type ChangeEvent, type FormEvent } from "react"
import { Logo, Button, AuthInput, Icon, Banner } from "../components"
import { validateMobile, validatePassword } from "../lib/formatters"
import type { LogInRequest } from "../types/auth"

export interface SignInProps {
  go?: (n: number) => void
  notify: (message: string, tone?: "success" | "error") => void
  onLogin: (credentials: LogInRequest) => Promise<{ success: boolean; error?: string }>
  onNavigateSignUp: () => void
  onBack: () => void
  isLoading?: boolean
  apiError?: string | null
}

export function SignIn({
  notify,
  onLogin,
  onNavigateSignUp,
  onBack,
  isLoading = false,
  apiError = null,
}: SignInProps) {
  const [mobile, setMobile] = useState(() => {
    try {
      return localStorage.getItem("rip_remembered_mobile") || ""
    } catch {
      return ""
    }
  })
  const [password, setPassword] = useState("")
  const [rememberAccount, setRememberAccount] = useState(() => {
    try {
      const saved = localStorage.getItem("rip_remember_me")
      return saved === null ? true : saved === "true"
    } catch {
      return true
    }
  })
  const [errors, setErrors] = useState<{ mobile?: string; password?: string }>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleMobileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 11)
    setMobile(digitsOnly)
    if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: undefined }))
    if (submitError) setSubmitError(null)
  }

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
    if (submitError) setSubmitError(null)
  }

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault()
    setSubmitError(null)

    const mobileCheck = validateMobile(mobile)
    const passwordCheck = validatePassword(password)

    const newErrors: { mobile?: string; password?: string } = {}
    if (!mobileCheck.isValid) newErrors.mobile = mobileCheck.error
    if (!passwordCheck.isValid) newErrors.password = passwordCheck.error

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      if (!passwordCheck.isValid) {
        notify(passwordCheck.error, "error")
      } else if (!mobileCheck.isValid) {
        notify(mobileCheck.error, "error")
      }
      return
    }

    try {
      if (rememberAccount) {
        localStorage.setItem("rip_remember_me", "true")
        localStorage.setItem("rip_remembered_mobile", mobile)
      } else {
        localStorage.removeItem("rip_remember_me")
        localStorage.removeItem("rip_remembered_mobile")
      }
    } catch {
      // ignore storage errors
    }

    // Call API via centralized session hook
    const result = await onLogin({
      mobile,
      password,
      remember: rememberAccount,
    })

    if (!result.success && result.error) {
      setSubmitError(result.error)
      notify(result.error, "error")
    }
  }

  const handleGoogleSignIn = () => {
    notify("Google Sign-In is awaiting backend OAuth configuration.", "error")
  }

  const activeError = submitError || apiError

  return (
    <main className="screen auth-screen">
      <button className="auth-back" onClick={onBack} aria-label="Go back">
        ‹
      </button>
      <div className="auth-brand">
        <Logo />
      </div>
      <div className="auth-heading">
        <span className="eyebrow">LANDLORD PORTAL</span>
        <h1>Sign in to your account</h1>
        <p>See your tenants, contracts, and rent reminders.</p>
      </div>

      {activeError && (
        <div style={{ marginBottom: "1rem" }}>
          <Banner tone="danger" icon="warning">
            {activeError}
          </Banner>
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <AuthInput
          label="Mobile number"
          placeholder="09XX XXX XXXX (11 digits)"
          value={mobile}
          onChange={handleMobileChange}
          inputMode="numeric"
          maxLength={11}
          error={errors.mobile}
          disabled={isLoading}
        />
        <AuthInput
          label="Password"
          placeholder="Enter your password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          error={errors.password}
          disabled={isLoading}
        />
        <div className="auth-actions-row">
          <label className="remember-account-toggle">
            <input
              type="checkbox"
              checked={rememberAccount}
              onChange={(e) => setRememberAccount(e.target.checked)}
              disabled={isLoading}
            />
            <span
              className="checkbox-box"
              style={{
                background: rememberAccount ? "var(--green)" : "#cbd5e1",
                color: "white",
              }}
            >
              {rememberAccount && <Icon name="check" size={12} />}
            </span>
            <p>Save account on this device</p>
          </label>
          <button
            type="button"
            className="forgot-link"
            onClick={() => notify("Password reset instructions sent.")}
          >
            Forgot password?
          </button>
        </div>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <div className="auth-divider">
        <span>or</span>
      </div>
      <Button
        variant="secondary"
        icon="user"
        onClick={handleGoogleSignIn}
        ariaLabel="Continue with Google Sign-In"
        disabled={isLoading}
      >
        Continue with Google
      </Button>
      <p className="auth-switch">
        New to Rent in Peace?{" "}
        <button type="button" onClick={onNavigateSignUp}>
          Create an account
        </button>
      </p>
    </main>
  )
}
