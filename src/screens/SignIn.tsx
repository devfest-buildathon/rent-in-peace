import { useState, type ChangeEvent, type FormEvent } from "react"
import { Logo, Button, AuthInput, Icon } from "../components"
import type { UserProfile } from "../types/user"
import { validateMobile, validatePassword } from "../lib/formatters"

export interface SignInProps {
  go: (n: number) => void
  notify: (message: string, tone?: "success" | "error") => void
  onLogin: (user: UserProfile, remember?: boolean) => void
}

export function SignIn({ go, notify, onLogin }: SignInProps) {
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

  const handleMobileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 11)
    setMobile(digitsOnly)
    if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: undefined }))
  }

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
  }

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault()
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

    const saved = localStorage.getItem("rip_registered_users")
    const usersMap = saved ? JSON.parse(saved) : {}
    const rememberedName = usersMap[mobile]?.name || "Landlord"
    const userObj: UserProfile = { name: rememberedName, mobile }

    onLogin(userObj, rememberAccount)
    notify(`Signed in as ${rememberedName}.`, "success")
    go(3)
  }

  const handleGoogleSignIn = () => {
    notify("Google Sign-In requires backend connection.", "error")
  }

  return (
    <main className="screen auth-screen">
      <button className="auth-back" onClick={() => go(0)} aria-label="Go back">
        ‹
      </button>
      <div className="auth-brand">
        <Logo />
      </div>
      <div className="auth-heading">
        <span className="eyebrow">WELCOME BACK</span>
        <h1>Sign in to your account</h1>
        <p>See your tenants, contracts, and rent reminders.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <AuthInput
          label="Mobile number"
          placeholder="09XX XXX XXXX (numbers only)"
          value={mobile}
          onChange={handleMobileChange}
          inputMode="numeric"
          maxLength={11}
          error={errors.mobile}
        />
        <AuthInput
          label="Password"
          placeholder="Enter your password"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          error={errors.password}
        />
        <div className="auth-actions-row">
          <label className="remember-account-toggle">
            <input
              type="checkbox"
              checked={rememberAccount}
              onChange={(e) => setRememberAccount(e.target.checked)}
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
        <Button onClick={handleSubmit}>Sign in</Button>
      </form>
      <div className="auth-divider">
        <span>or</span>
      </div>
      <Button
        variant="secondary"
        icon="user"
        onClick={handleGoogleSignIn}
        ariaLabel="Continue with Google Sign-In"
      >
        Continue with Google
      </Button>
      <p className="auth-switch">
        New to Rent in Peace?{" "}
        <button onClick={() => go(2)}>Create an account</button>
      </p>
    </main>
  )
}
