import { useState } from "react"
import { TopBar, Banner, Button, Icon } from "../components"
import type { ContractData } from "../types/contract"

export interface RentRemindersProps {
  go: (n: number) => void
  notify: (message: string, tone?: "success" | "error") => void
  contracts: ContractData[]
}

export function RentReminders({ go, notify, contracts }: RentRemindersProps) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({})

  const toggle = (id: string) => {
    setEnabled((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }))
  }

  return (
    <main className="screen">
      <TopBar title="Rent reminders" back={() => go(3)} />
      <div className="page-intro compact">
        <span className="eyebrow">PAYMENT FOLLOW-UPS</span>
        <h1>Friendly reminders, on time</h1>
        <p>
          We remind you when rent is due. You choose whether to message the tenant.
        </p>
      </div>
      <Banner tone="info" icon="bell">
        Tenants do not receive anything automatically. You stay in control.
      </Banner>
      {contracts.length > 0 ? (
        <div className="reminder-list">
          {contracts.map((c) => {
            const isRowEnabled = enabled[c.id] ?? true
            return (
              <div className="reminder-row" key={c.id}>
                <span className="reminder-person">
                  <strong>{c.tenantName || "Tenant"}</strong>
                  <small>
                    {c.roomUnit || "Unit"} · {c.dueDate || "Every 5th"} · 9:00 AM
                  </small>
                </span>
                <button
                  type="button"
                  className={`toggle ${isRowEnabled ? "on" : ""}`}
                  onClick={() => toggle(c.id)}
                  aria-label={`Toggle reminder for ${c.tenantName || "Tenant"}`}
                >
                  <span />
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="empty" style={{ padding: "30px 16px", textAlign: "center" }}>
          <p style={{ color: "var(--muted)", fontSize: "13px" }}>
            No active contracts yet. Reminders will appear once you add a tenant contract.
          </p>
        </div>
      )}
      <div className="reminder-tip">
        <Icon name="handshake" />
        <p>Messages use friendly language and never include private ID data.</p>
      </div>
      <div className="bottom-action">
        <Button onClick={() => notify("Reminder settings saved.")} ariaLabel="Save reminder settings">
          Save reminder settings
        </Button>
      </div>
    </main>
  )
}
