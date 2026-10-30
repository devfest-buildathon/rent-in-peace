import { useState } from "react"
import { Button, Icon } from "../components"
import type { ContractData } from "../types/contract"
import { formatPesos } from "../lib/formatters"

export interface SuccessProps {
  go: (n: number) => void
  notify: (message: string, tone?: "success" | "error") => void
  contract: ContractData
}

export function Success({ go, notify, contract }: SuccessProps) {
  const [remind, setRemind] = useState(true)

  return (
    <main className="screen success-screen">
      <div className="success-confetti">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="success-art">
        <span>
          <Icon name="document" size={56} />
        </span>
        <i>
          <Icon name="check" size={30} />
        </i>
      </div>
      <div className="success-copy">
        <span className="eyebrow">ALL DONE</span>
        <h1>Your contract is ready.</h1>
        <p>
          Your clear, friendly contract for {contract.roomUnit || "your unit"} is ready to sign.
        </p>
      </div>
      <div className="reminder-card">
        <div className="reminder-icon">
          <Icon name="bell" />
        </div>
        <div>
          <strong>Monthly rent reminder</strong>
          <small>
            {contract.dueDate || "Every 5th"} of the month · {formatPesos(contract.monthlyRent)}
          </small>
        </div>
        <button
          type="button"
          className={`toggle ${remind ? "on" : ""}`}
          onClick={() => {
            setRemind(!remind)
            notify(remind ? "Rent reminder disabled." : "Rent reminder enabled.")
          }}
          aria-label="Toggle monthly rent reminder"
        >
          <span />
        </button>
      </div>
      <div className="action-stack">
        <Button
          icon="document"
          onClick={() => {
            window.print()
            notify("PDF dialog opened.")
          }}
          ariaLabel="Save Contract as PDF"
        >
          Save PDF
        </Button>
        <Button
          variant="secondary"
          icon="bell"
          onClick={() => go(15)}
          ariaLabel="Go to Rent Reminders"
        >
          Add rent reminder
        </Button>
        <Button variant="ghost" onClick={() => go(3)} ariaLabel="Back to dashboard">
          Back to dashboard
        </Button>
      </div>
    </main>
  )
}
