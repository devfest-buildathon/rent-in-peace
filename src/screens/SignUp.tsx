import { useState, type ChangeEvent, type FormEvent } from "react"
import { Logo, Button, AuthInput, Icon, Banner } from "../components"
import { validateName, validateMobile, validatePassword } from "../lib/formatters"
import type { SignUpRequest } from "../types/auth"

export interface SignUpProps {
  go?: (n: number) => void
  notify?: (message: string, tone?: "success" | "error") => void
  onRegister: (data: SignUpRequest) => Promise<{ success: boolean; error?: string }>
  onNavigateSignIn: () => void
  onBack: () => void
  isLoading?: boolean
  apiError?: string | null
}

export function SignUp({
  notify,
  onRegister,
  onNavigateSignIn,
  onBack,
  isLoading = false,
  apiError = null,
}: SignUpProps) {
  const [name, setName] = useState("")
  const [mobile, setMobile] = useState("")
  const [password, setPassword] = useState("")
  const [consent, setConsent] = useState(true)
  const [errors, setErrors] = useState<{
    name?: string
    mobile?: string
    password?: string
    consent?: string
  }>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Only accept letters, spaces, hyphens, and apostrophes; numbers are stripped
    const sanitized = e.target.value.replace(/[0-9]/g, "")
    setName(sanitized)
    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
    if (submitError) setSubmitError(null)
  }

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

    const nameCheck = validateName(name)
    const mobileCheck = validateMobile(mobile)
    const passCheck = validatePassword(password)

    const newErrors: {
      name?: string
      mobile?: string
      password?: string
      consent?: string
    } = {}

    if (!nameCheck.isValid) newErrors.name = nameCheck.error
    if (!mobileCheck.isValid) newErrors.mobile = mobileCheck.error
    if (!passCheck.isValid) newErrors.password = passCheck.error
    if (!consent) newErrors.consent = "You must agree to the Terms and Privacy Notice."

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      if (notify) {
        if (!passCheck.isValid) {
          notify(passCheck.error, "error")
        } else if (!mobileCheck.isValid) {
          notify(mobileCheck.error, "error")
        } else if (!nameCheck.isValid) {
          notify(nameCheck.error, "error")
        } else if (!consent) {
          notify("You must agree to the Terms and Privacy Notice.", "error")
        }
      }
      return
    }

    // Call API via centralized session hook
    const result = await onRegister({
      name: name.trim(),
      mobile: mobile.trim(),
      password,
    })

    if (!result.success && result.error) {
      setSubmitError(result.error)
      if (notify) notify(result.error, "error")
    }
  }

  const handleGoogleSignUp = () => {
    if (notify) notify("Google Sign-In is awaiting backend OAuth configuration.", "error")
  }

  const activeError = submitError || apiError

  return (
    <main className="screen auth-screen">
      <button className="auth-back" onClick={onBack} aria-label="Go back">
        ‹
      </button>
      <div className="auth-brand compact-brand">
        <Logo compact />
      </div>
      <div className="auth-heading">
        <span className="eyebrow">LANDLORD PORTAL</span>
        <h1>Create your account</h1>
        <p>Keep every contract and tenant detail in one safe place.</p>
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
          label="Full legal name"
          placeholder="Juan Dela Cruz (letters only)"
          value={name}
          onChange={handleNameChange}
          error={errors.name}
          disabled={isLoading}
        />
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
          placeholder="At least 8 chars (upper, lower, num, symbol)"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          error={errors.password}
          disabled={isLoading}
        />
        <label className="auth-check-row">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked)
              if (errors.consent) setErrors((prev) => ({ ...prev, consent: undefined }))
            }}
            disabled={isLoading}
          />
          <span
            className="checkbox-box"
            style={{
              background: consent ? "var(--green)" : "#cbd5e1",
              color: "white",
            }}
          >
            {consent && <Icon name="check" size={12} />}
          </span>
          <p>
            I agree to the Terms of Service and Privacy Notice for landlords.
          </p>
        </label>
        {errors.consent && (
          <span className="auth-error-msg">{errors.consent}</span>
        )}
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create free account"}
        </Button>
      </form>
      <div className="auth-divider">
        <span>or</span>
      </div>
      <Button
        variant="secondary"
        icon="user"
        onClick={handleGoogleSignUp}
        ariaLabel="Continue with Google Sign-Up"
        disabled={isLoading}
      >
        Sign up with Google
      </Button>
      <p className="auth-switch">
        Already have an account?{" "}
        <button type="button" onClick={onNavigateSignIn}>
          Sign in
        </button>
      </p>
    </main>
  )
}
