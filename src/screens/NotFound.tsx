import { Logo, Button, Icon, Banner } from "../components"
import type { UserRole } from "../types/session"

export interface NotFoundProps {
  reason?: string | null
  currentRole: UserRole
  onGoHome: () => void
  onSwitchRole?: (role: UserRole) => void
}

export function NotFound({ reason, currentRole, onGoHome, onSwitchRole }: NotFoundProps) {
  return (
    <main className="screen not-found-screen">
      <div className="welcome-brand">
        <Logo compact />
      </div>

      <div className="hero-illustration" style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}>
        <div className="hero-house" style={{ background: "#fef3c7" }}>
          <Icon name="warning" size={48} />
        </div>
      </div>

      <div className="welcome-copy" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
        <span
          className="chip"
          style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: "999px",
            fontSize: "0.75rem",
            fontWeight: 600,
            background: "#f3f4f6",
            color: "#4b5563",
            marginBottom: "0.75rem",
          }}
        >
          {currentRole === "landlord"
            ? "Browsing as: Landlord"
            : currentRole === "tenant"
            ? "Browsing as: Tenant"
            : "No Active Role"}
        </span>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem" }}>
          Screen not available
        </h1>
        <p style={{ color: "#6b7280", fontSize: "0.9375rem", lineHeight: 1.5 }}>
          {reason || "The link you followed doesn't exist, is expired, or is restricted for your current role."}
        </p>
      </div>

      {reason && (
        <div style={{ marginBottom: "1.5rem" }}>
          <Banner tone="info" icon="shield">
            <strong>Role Separation:</strong> Tenants can only view tenant screens and cannot access landlord management. Landlords cannot view tenant-exclusive screens.
          </Banner>
        </div>
      )}

      <div className="action-stack" style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <Button onClick={onGoHome} ariaLabel="Return to Welcome Screen">
          <Icon name="house" /> Back to Welcome
        </Button>

        {currentRole === "tenant" && onSwitchRole && (
          <Button
            variant="secondary"
            onClick={() => onSwitchRole("landlord")}
            ariaLabel="Switch to Landlord View"
          >
            I am a landlord instead
          </Button>
        )}

        {currentRole === "landlord" && onSwitchRole && (
          <Button
            variant="secondary"
            onClick={() => onSwitchRole("tenant")}
            ariaLabel="Switch to Tenant View"
          >
            I have an invite code instead
          </Button>
        )}
      </div>
    </main>
  )
}
