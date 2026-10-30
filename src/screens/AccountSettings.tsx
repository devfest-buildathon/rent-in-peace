import { useState } from "react"
import { TopBar, Banner, Section, Button, Icon } from "../components"
import type { UserProfile } from "../types/user"

export interface AccountSettingsProps {
  go: (n: number) => void
  notify: (message: string, tone?: "success" | "error") => void
  user: UserProfile | null
  onSignOut: () => void
}

export function AccountSettings({
  go,
  notify,
  user,
  onSignOut,
}: AccountSettingsProps) {
  const [confirmLogout, setConfirmLogout] = useState(false)
  const landlordName = user?.name || "Landlord"
  const initials =
    landlordName
      .split(" ")
      .filter(Boolean)
      .map((x) => x[0].toUpperCase())
      .slice(0, 2)
      .join("") || "L"

  return (
    <main className="screen">
      <TopBar title="Account & settings" back={() => go(3)} />
      <div className="account-profile">
        <span className="avatar large">{initials}</span>
        <div>
          <h1>{landlordName}</h1>
          <p>Landlord account · {user?.mobile || "Not set"}</p>
        </div>
      </div>
      <Banner tone="success" icon="handshake">
        <strong>This app is for the landlord.</strong> Tenants receive shared summaries or PDFs—no account or app download needed.
      </Banner>
      <Section title="Account">
        <div className="settings-list">
          <button
            type="button"
            onClick={() => notify("Landlord account is up to date.")}
            aria-label="Personal information"
          >
            <span>
              <Icon name="user" />
              <b>Personal information</b>
            </span>
            <Icon name="arrow" size={16} />
          </button>
          <button
            type="button"
            onClick={() => go(15)}
            aria-label="Rent reminders"
          >
            <span>
              <Icon name="bell" />
              <b>Rent reminders</b>
            </span>
            <Icon name="arrow" size={16} />
          </button>
          <button
            type="button"
            onClick={() => go(13)}
            aria-label="Privacy and help"
          >
            <span>
              <Icon name="shield" />
              <b>Privacy & help</b>
            </span>
            <Icon name="arrow" size={16} />
          </button>
        </div>
      </Section>
      <button
        type="button"
        className="logout-button"
        onClick={() => setConfirmLogout(true)}
      >
        Sign out of Rent in Peace
      </button>
      <p className="logout-note">
        Signing out will not delete your tenants or contracts.
      </p>
      {confirmLogout && (
        <div className="confirm-overlay">
          <button
            type="button"
            className="confirm-backdrop"
            onClick={() => setConfirmLogout(false)}
            aria-label="Cancel sign out"
          />
          <div className="confirm-sheet">
            <span className="confirm-icon">
              <Icon name="user" />
            </span>
            <h2>Sign out?</h2>
            <p>You can sign back in anytime using your mobile number.</p>
            <Button
              onClick={() => {
                setConfirmLogout(false)
                onSignOut()
              }}
              ariaLabel="Confirm sign out"
            >
              Yes, sign out
            </Button>
            <Button variant="ghost" onClick={() => setConfirmLogout(false)} ariaLabel="Stay signed in">
              Stay signed in
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
