import { useState } from "react"
import { TopBar, Section, Button, Icon, Chip } from "../components"
import type { ContractData } from "../types/contract"
import { formatPesos } from "../lib/formatters"

export interface TenantDetailProps {
  go: (n: number) => void
  notify: (message: string, tone?: "success" | "error") => void
  contract: ContractData | null
  onDeleteContract: (id: string) => void
  onSelectContract: (c: ContractData) => void
}

export function TenantDetail({
  go,
  notify,
  contract,
  onDeleteContract,
  onSelectContract,
}: TenantDetailProps) {
  const [showOptions, setShowOptions] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<Record<string, boolean>>({
    Current: false,
    Previous: true,
  })

  if (!contract) {
    return (
      <main className="screen">
        <TopBar title="Tenant details" back={() => go(11)} />
        <div className="empty" style={{ padding: "40px 20px", textAlign: "center" }}>
          <Icon name="user" size={40} />
          <h3>No tenant selected</h3>
          <p>Please select a tenant from your tenants list.</p>
          <Button onClick={() => go(11)}>Go to My Tenants</Button>
        </div>
      </main>
    )
  }

  const initials =
    contract.tenantName
      .split(" ")
      .filter(Boolean)
      .map((x) => x[0].toUpperCase())
      .slice(0, 2)
      .join("") || "T"

  return (
    <main className="screen">
      <TopBar
        title="Tenant details"
        back={() => go(11)}
        right={
          <button
            type="button"
            className="icon-btn"
            onClick={() => setShowOptions(true)}
            aria-label="Options"
          >
            •••
          </button>
        }
      />
      <div className="tenant-hero">
        <span className="avatar large">{initials}</span>
        <h1>{contract.tenantName}</h1>
        <p>{contract.roomUnit || "Unit"} · {contract.propertyType}</p>
        <Chip tone="good">Active contract</Chip>
      </div>
      <div className="next-due">
        <div>
          <span>NEXT PAYMENT</span>
          <strong>{contract.dueDate}</strong>
          <small>{contract.tenantContact || "Contact on file"}</small>
        </div>
        <b>{formatPesos(contract.monthlyRent)}</b>
      </div>
      <Section title="Contract summary">
        <div className="summary-list">
          <p>
            <span>Lease term</span>
            <strong>{contract.duration} · Started {contract.startDate}</strong>
          </p>
          <p>
            <span>Deposit</span>
            <strong>{formatPesos(contract.securityDeposit)}</strong>
          </p>
          <p>
            <span>Utilities</span>
            <strong>{contract.electricityType} + {contract.waterType}</strong>
          </p>
        </div>
        <Button
          variant="secondary"
          icon="document"
          onClick={() => {
            onSelectContract(contract)
            go(8)
          }}
          ariaLabel="View contract document"
        >
          View contract
        </Button>
      </Section>
      <Section title="Payment records">
        <div className="payments">
          {[
            { id: "Current", label: "Current cycle", dueText: `Due ${contract.dueDate}` },
            { id: "Previous", label: "Previous cycle", dueText: "Paid on time" },
          ].map((item) => {
            const isPaid = paymentStatus[item.id]
            return (
              <div
                key={item.id}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setPaymentStatus((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    setPaymentStatus((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                  }
                }}
                aria-label={`Mark ${item.label} as ${isPaid ? "unpaid" : "paid"}`}
              >
                <span className={`payment-check ${isPaid ? "paid" : "unpaid"}`}>
                  <Icon name={isPaid ? "check" : "bell"} size={16} />
                </span>
                <p>
                  <strong>{item.label}</strong>
                  <small>{isPaid ? "Paid" : item.dueText}</small>
                </p>
                <b className={isPaid ? "paid" : "unpaid"}>{isPaid ? "Paid" : "Pending"}</b>
              </div>
            )
          })}
        </div>
      </Section>
      <div className="bottom-action">
        <Button
          icon="bell"
          onClick={() =>
            notify(
              `Rent reminder sent to ${contract.tenantName} (${contract.tenantContact || "saved contact"}).`,
              "success"
            )
          }
          ariaLabel="Send rent reminder to tenant"
        >
          Send reminder
        </Button>
      </div>

      {showOptions && (
        <div className="confirm-overlay">
          <button
            type="button"
            className="confirm-backdrop"
            onClick={() => setShowOptions(false)}
            aria-label="Close menu"
          />
          <div className="confirm-sheet">
            <h2>Tenant record options</h2>
            <p>Manage {contract.tenantName}'s record.</p>
            <Button
              variant="secondary"
              onClick={() => {
                setShowOptions(false)
                onSelectContract(contract)
                go(8)
              }}
              ariaLabel="View full contract document"
            >
              View full contract
            </Button>
            <Button
              variant="ghost"
              style={{ color: "#dc2626" }}
              onClick={() => {
                setShowOptions(false)
                setShowDeleteConfirm(true)
              }}
              ariaLabel="Delete tenant record"
            >
              Delete tenant record
            </Button>
            <Button variant="ghost" onClick={() => setShowOptions(false)} ariaLabel="Cancel">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="confirm-overlay">
          <button
            type="button"
            className="confirm-backdrop"
            onClick={() => setShowDeleteConfirm(false)}
            aria-label="Cancel delete"
          />
          <div className="confirm-sheet">
            <span className="confirm-icon" style={{ color: "#dc2626" }}>
              <Icon name="warning" />
            </span>
            <h2>Delete tenant record?</h2>
            <p>
              This will remove {contract.tenantName}'s contract and records from your account.
            </p>
            <Button
              variant="danger"
              onClick={() => {
                setShowDeleteConfirm(false)
                onDeleteContract(contract.id)
              }}
              ariaLabel="Confirm delete tenant record"
            >
              Yes, delete record
            </Button>
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} ariaLabel="Keep record">
              Keep record
            </Button>
          </div>
        </div>
      )}
    </main>
  )
}
