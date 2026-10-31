import { Logo, Button, Icon, type IconName } from "../components"
import type { UserProfile } from "../types/user"
import { LEGAL_DISCLAIMER } from "../lib/constants"

export interface WelcomeProps {
  go?: (n: number) => void
  onSelectLandlord: () => void
  onSelectTenant: () => void
  user?: UserProfile | null
  onContinueLandlord?: () => void
}

export function Welcome({
  onSelectLandlord,
  onSelectTenant,
  user,
  onContinueLandlord,
}: WelcomeProps) {
  const benefits: [IconName, string, string][] = [
    ["document", "Clear contracts", "Easy to review"],
    ["shield", "Spot risky terms", "Helpful checks"],
    ["handshake", "Editable contract", "Customize anytime"],
  ]

  return (
    <main className="screen welcome">
      <div className="welcome-glow" />
      <div className="welcome-brand">
        <Logo />
      </div>
      <div className="hero-illustration">
        <div className="hero-house">
          <Icon name="house" size={64} />
          <span>
            <Icon name="check" size={20} />
          </span>
        </div>
        <div className="hero-people">
          <i />
          <i />
        </div>
      </div>
      <div className="welcome-copy">
        <h1>
          Make a clear rental
          <br />
          contract in minutes.
        </h1>
        <p>Friendly guidance for landlords and tenants in Cagayan de Oro.</p>
      </div>
      <div className="benefit-row">
        {benefits.map(([icon, title, text]) => (
          <div className="mini-card" key={title}>
            <Icon name={icon} />
            <strong>{title}</strong>
            <small>{text}</small>
          </div>
        ))}
      </div>
      <div className="action-stack">
        {user ? (
          <>
            <Button
              onClick={onContinueLandlord || onSelectLandlord}
              ariaLabel={`Continue as Landlord ${user.name}`}
            >
              Continue as Landlord ({user.name.split(" ")[0]}) <Icon name="arrow" />
            </Button>
            <Button
              variant="secondary"
              onClick={onSelectTenant}
              ariaLabel="I have a code from my landlord"
            >
              I have a code from my landlord
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onSelectLandlord} ariaLabel="I'm a landlord">
              I'm a landlord <Icon name="arrow" />
            </Button>
            <Button
              variant="secondary"
              onClick={onSelectTenant}
              ariaLabel="I have a code from my landlord"
            >
              I have a code from my landlord
            </Button>
          </>
        )}
      </div>
      <p className="legal-note">{LEGAL_DISCLAIMER}</p>
    </main>
  )
}
