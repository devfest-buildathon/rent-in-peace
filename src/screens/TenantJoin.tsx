import { useState, type ChangeEvent, type FormEvent } from "react"
import { Logo, Button, AuthInput, Icon, Banner } from "../components"

export interface TenantJoinProps {
  initialCode?: string
  onSubmitCode?: (code: string) => void
  onBack: () => void
  notify?: (message: string, tone?: "success" | "error") => void
}

export function TenantJoin({
  initialCode = "",
  onSubmitCode,
  onBack,
  notify,
}: TenantJoinProps) {
  const [code, setCode] = useState(initialCode)
  const [error, setError] = useState<string | null>(null)

  const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 12)
    setCode(val)
    if (error) setError(null)
  }

  const handleSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) {
      const err = "Please enter the invite code from your landlord."
      setError(err)
      if (notify) notify(err, "error")
      return
    }

    if (trimmed.length < 4) {
      const err = "Invite codes must be at least 4 characters long."
      setError(err)
      if (notify) notify(err, "error")
      return
    }

    if (onSubmitCode) {
      onSubmitCode(trimmed)
    } else {
      if (notify) notify(`Checking invite code: ${trimmed}...`, "success")
    }
  }

  return (
    <main className="screen auth-screen">
      <button className="auth-back" onClick={onBack} aria-label="Go back">
        ‹
      </button>
      <div className="auth-brand compact-brand">
        <Logo compact />
      </div>
      <div className="auth-heading">
        <span className="eyebrow" style={{ color: "#2563eb" }}>TENANT PORTAL</span>
        <h1>Enter your invite code</h1>
        <p>Your landlord gave you this code or sent an invite link via SMS or Messenger.</p>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <Banner tone="info" icon="shield">
          <strong>No account needed:</strong> As a tenant, you don't need to sign up or create passwords. Simply enter your code to view and review your contract.
        </Banner>
      </div>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <AuthInput
          label="Invite Code"
          placeholder="e.g. CDO-7890"
          value={code}
          onChange={handleCodeChange}
          error={error || undefined}
          autoCapitalize="characters"
        />

        <Button onClick={handleSubmit}>
          Continue <Icon name="arrow" />
        </Button>
      </form>

      <p className="auth-switch" style={{ marginTop: "2rem" }}>
        Are you a landlord?{" "}
        <button type="button" onClick={onBack}>
          Go to Landlord Portal
        </button>
      </p>
    </main>
  )
}

