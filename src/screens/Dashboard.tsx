import { Logo, Icon, Banner, TabBar } from "../components"
import type { UserProfile } from "../types/user"
import type { ContractData } from "../types/contract"
import { formatPesos } from "../lib/formatters"

export interface DashboardProps {
  go: (n: number) => void
  notify: (message: string, tone?: "success" | "error") => void
  user: UserProfile | null
  contracts: ContractData[]
  onSelectContract: (c: ContractData) => void
  onNewContract: () => void
}

export function Dashboard({
  go,
  notify,
  user,
  contracts,
  onSelectContract,
  onNewContract,
}: DashboardProps) {
  const landlordName = user?.name || "Landlord"
  const firstName = landlordName.split(" ")[0]
  const initials = landlordName
    .split(" ")
    .filter(Boolean)
    .map((x) => x[0].toUpperCase())
    .slice(0, 2)
    .join("")

  const latestContract = contracts[0] || null

  return (
    <main className="screen dashboard-screen">
      <div className="dashboard-top">
        <Logo compact />
        <button
          className="dashboard-avatar"
          onClick={() => go(14)}
          title="Account Settings"
          aria-label="Account Settings"
        >
          {initials || "L"}
        </button>
      </div>
      <div className="dashboard-greeting">
        <div>
          <span>GOOD MORNING</span>
          <h1>Hi, {firstName}.</h1>
          <p>Everything about your rentals, in one place.</p>
        </div>
        <button
          className="notification-button"
          aria-label="Notifications"
          onClick={() =>
            notify(
              contracts.length > 0
                ? "You have rent payments scheduled."
                : "Welcome to Rent in Peace!"
            )
          }
        >
          <Icon name="bell" />
          {contracts.length > 0 && <i />}
        </button>
      </div>
      <button className="dashboard-cta" onClick={onNewContract} aria-label="Create a new rental contract">
        <span>
          <Icon name="plus" size={24} />
        </span>
        <div>
          <strong>Create a new contract</strong>
          <small>Guided, clear, and ready in minutes</small>
        </div>
        <Icon name="arrow" />
      </button>
      <div className="dashboard-stats">
        <button onClick={() => go(11)} aria-label="View Active Contracts">
          <strong>{contracts.length}</strong>
          <span>{contracts.length === 1 ? "Active contract" : "Active contracts"}</span>
        </button>
        <button onClick={() => go(15)} aria-label="View Rent Reminders">
          <strong>{contracts.length > 0 ? contracts.length : 0}</strong>
          <span>Rent reminders</span>
        </button>
      </div>
      <div className="dashboard-section-head">
        <h2>Coming up</h2>
        {contracts.length > 0 && <button onClick={() => go(11)}>See all</button>}
      </div>
      {latestContract ? (
        <button
          className="due-card"
          onClick={() => {
            onSelectContract(latestContract)
            go(12)
          }}
          aria-label={`View tenancy for ${latestContract.tenantName || "Tenant"}`}
        >
          <span className="due-date">
            <b>{latestContract.dueDate?.replace(/\D/g, "") || "05"}</b>
            <small>DUE</small>
          </span>
          <span className="due-person">
            <strong>{latestContract.tenantName || "Tenant"}</strong>
            <small>
              {latestContract.roomUnit || "Unit"} · {formatPesos(latestContract.monthlyRent)} rent
            </small>
          </span>
          <span className="status warn">Due soon</span>
        </button>
      ) : (
        <div className="empty-state" style={{ margin: "6px 0 16px" }}>
          <p style={{ margin: 0, fontSize: "11px" }}>
            No active contracts yet. Tap above to create your first contract.
          </p>
        </div>
      )}
      <div className="dashboard-section-head">
        <h2>Quick actions</h2>
      </div>
      <div className="quick-actions">
        <button onClick={() => go(11)} aria-label="My tenants">
          <span>
            <Icon name="user" />
          </span>
          My tenants
        </button>
        <button
          onClick={() => {
            if (contracts.length > 0) {
              onSelectContract(contracts[0])
              go(8)
            } else {
              onNewContract()
            }
          }}
          aria-label="Contracts"
        >
          <span>
            <Icon name="document" />
          </span>
          Contracts
        </button>
        <button onClick={() => go(15)} aria-label="Rent Reminders">
          <span>
            <Icon name="bell" />
          </span>
          Reminders
        </button>
        <button onClick={() => go(13)} aria-label="Help and Privacy">
          <span>
            <Icon name="help" />
          </span>
          Help & privacy
        </button>
      </div>
      <Banner tone="success" icon="shield">
        <strong>Your records are private.</strong> ID photos are never saved.
      </Banner>
      <TabBar active={0} go={go} onNewContract={onNewContract} />
    </main>
  )
}
