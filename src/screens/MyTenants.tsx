import { useState } from "react"
import { TopBar, TabBar, Button, Icon } from "../components"
import type { ContractData } from "../types/contract"
import { formatPesos } from "../lib/formatters"

export interface MyTenantsProps {
  go: (n: number) => void
  contracts: ContractData[]
  onSelectContract: (c: ContractData) => void
  startNewContract: () => void
}

export function MyTenants({
  go,
  contracts,
  onSelectContract,
  startNewContract,
}: MyTenantsProps) {
  const [filter, setFilter] = useState("All")
  const [search, setSearch] = useState("")

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      !search ||
      c.tenantName.toLowerCase().includes(search.toLowerCase()) ||
      c.roomUnit.toLowerCase().includes(search.toLowerCase())
    if (!matchesSearch) return false
    if (filter === "All") return true
    if (filter === "Active") return c.status === "Active"
    return true
  })

  return (
    <main className="screen">
      <TopBar
        right={
          <button className="icon-btn" onClick={() => go(13)} aria-label="Help">
            <Icon name="help" />
          </button>
        }
      />
      <div className="page-intro compact">
        <span className="eyebrow">YOUR RENTALS</span>
        <h1>My tenants</h1>
        <p>Rent dates and contracts, all in one place.</p>
      </div>
      <div className="search">
        <Icon name="search" />
        <input
          placeholder="Search tenant or unit"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search tenant or unit"
        />
      </div>
      <div className="filter-row">
        {["All", "Active", "Due soon"].map((x) => (
          <button
            type="button"
            className={filter === x ? "active" : ""}
            onClick={() => setFilter(x)}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>
      {filteredContracts.length > 0 ? (
        <div className="tenant-list">
          {filteredContracts.map((t) => {
            const initials =
              t.tenantName
                .split(" ")
                .filter(Boolean)
                .map((x) => x[0].toUpperCase())
                .slice(0, 2)
                .join("") || "T"

            return (
              <button
                type="button"
                className="tenant-card"
                onClick={() => {
                  onSelectContract(t)
                  go(12)
                }}
                key={t.id}
                aria-label={`View details for tenant ${t.tenantName || "Unnamed Tenant"}`}
              >
                <span className="avatar">{initials}</span>
                <span className="tenant-main">
                  <strong>{t.tenantName || "Unnamed Tenant"}</strong>
                  <small>
                    {t.roomUnit || "Unit"} · {t.propertyType.split("/")[0].trim()}
                  </small>
                  <b>{formatPesos(t.monthlyRent)} / month</b>
                </span>
                <span className="tenant-side">
                  <em className="status good">Active</em>
                  <small>{t.dueDate}</small>
                  <Icon name="arrow" size={16} />
                </span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="empty" style={{ padding: "36px 16px", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              padding: "12px",
              background: "var(--mint)",
              borderRadius: "50%",
              marginBottom: "12px",
              color: "var(--green)",
            }}
          >
            <Icon name="user" size={32} />
          </div>
          <h3>{contracts.length === 0 ? "No tenants yet" : "No matching tenants"}</h3>
          <p style={{ margin: "4px 0 16px", color: "var(--muted)", fontSize: "13px" }}>
            {contracts.length === 0
              ? "Start by creating a rental contract for your first tenant."
              : "Try searching with a different name or unit."}
          </p>
          {contracts.length === 0 && (
            <Button icon="plus" onClick={startNewContract}>
              Create a contract
            </Button>
          )}
        </div>
      )}
      <TabBar active={2} go={go} onNewContract={startNewContract} />
    </main>
  )
}
