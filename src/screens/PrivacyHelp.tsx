import { useState } from "react"
import { TopBar, Section, Banner, Button, Icon } from "../components"

export interface PrivacyHelpProps {
  go: (n: number) => void
}

export function PrivacyHelp({ go }: PrivacyHelpProps) {
  const [open, setOpen] = useState(0)
  const faq = [
    [
      "Is this legal advice?",
      "No. Rent in Peace helps you prepare and understand a template contract, but it does not replace advice from a lawyer.",
    ],
    [
      "Where is my tenant’s ID photo?",
      "It is not saved. The image is only used briefly in memory to read details you approve.",
    ],
    [
      "Can I edit the contract clauses?",
      "Yes! When viewing the contract preview, click 'Edit Paper' to edit titles, clause texts, or add custom terms.",
    ],
    [
      "How do I delete a tenant?",
      "Open the tenant record, choose the menu, then select Delete record.",
    ],
  ]

  return (
    <main className="screen">
      <TopBar title="Privacy & help" back={() => go(3)} />
      <div className="privacy-hero">
        <span>
          <Icon name="shield" size={34} />
        </span>
        <h1>Your details stay yours.</h1>
        <p>
          We keep privacy simple and explain what happens to your information.
        </p>
      </div>
      <div className="privacy-points">
        {[
          "We only ask for what the contract needs.",
          "ID photos are never stored.",
          "You can edit the contract and delete tenant records anytime.",
        ].map((x) => (
          <div key={x}>
            <span>
              <Icon name="check" size={15} />
            </span>
            <p>{x}</p>
          </div>
        ))}
      </div>
      <Section title="Frequently asked questions">
        <div className="faq">
          {faq.map(([q, a], i) => (
            <button
              type="button"
              onClick={() => setOpen(open === i ? -1 : i)}
              key={q}
              aria-expanded={open === i}
            >
              <span>
                <strong>{q}</strong>
                {open === i && <p>{a}</p>}
              </span>
              <Icon name="chevron" />
            </button>
          ))}
        </div>
      </Section>
      <Banner tone="success" icon="handshake">
        <strong>Need more help?</strong> Talk to your city legal office or a trusted legal professional.
      </Banner>
      <div className="bottom-action">
        <Button variant="secondary" onClick={() => go(3)} ariaLabel="Back to dashboard">
          Back to dashboard
        </Button>
      </div>
    </main>
  )
}
