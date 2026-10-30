import { useState, type ChangeEvent, type FormEvent } from "react"
import { Logo, Button, AuthInput, Icon, Banner } from "../components"
import type { UserProfile } from "../types/user"
import { validateName, validateMobile, validatePassword } from "../lib/formatters"

export interface SignUpProps {
  go: (n: number) => void
  notify?: (message: string, tone?: "success" | "error") => void
  onRegister: (user: UserProfile) => void
}

export function SignUp({ go, notify, onRegister }: SignUpProps) {
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

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Only accept letters, spaces, hyphens, and apostrophes; numbers are not considered!
    const sanitized = e.target.value.replace(/[0-9]/g, "")
    setName(sanitized)
    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
  }

  const handleMobileChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Only accept numbers: non-digits are stripped and not considered
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

    const userObj: UserProfile = { name: name.trim(), mobile: mobile.trim() }
    const saved = localStorage.getItem("rip_registered_users")
    const usersMap = saved ? JSON.parse(saved) : {}
    usersMap[mobile.trim()] = userObj
    localStorage.setItem("rip_registered_users", JSON.stringify(usersMap))

    onRegister(userObj)
    if (notify) notify(`Account created for ${name.trim()}!`, "success")
    go(3)
  }

  return (
    <main className="screen auth-screen">
      <button className="auth-back" onClick={() => go(0)} aria-label="Go back">
        ‹
      </button>
      <div className="auth-brand compact-brand">
        <Logo compact />
      </div>
      <div className="auth-heading">
        <span className="eyebrow">GET STARTED</span>
        <h1>Create your account</h1>
        <p>Keep every contract and tenant detail in one safe place.</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <AuthInput
          label="Full name"
          placeholder="Complete name (letters only)"
          value={name}
          onChange={handleNameChange}
          error={errors.name}
        />
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
          label="Create password"
          placeholder="At least 8 characters"
          type="password"
          value={password}
          onChange={handlePasswordChange}
          error={errors.password}
        />

        <label className="auth-consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked)
              if (errors.consent) setErrors((prev) => ({ ...prev, consent: undefined }))
            }}
          />
          <span style={{ background: consent ? "var(--green)" : "#cbd5e1" }}>
            {consent && <Icon name="check" size={12} />}
          </span>
          <p>I agree to the Terms and Privacy Notice.</p>
        </label>
        {errors.consent && <span className="auth-error-text">{errors.consent}</span>}

        <Button onClick={handleSubmit}>Create account</Button>
      </form>
      <Banner tone="info" icon="shield">
        Your account keeps contract records private and available across your devices.
      </Banner>
      <p className="auth-switch">
        Already have an account?{" "}
        <button onClick={() => go(1)}>Sign in</button>
      </p>
    </main>
  )
}
