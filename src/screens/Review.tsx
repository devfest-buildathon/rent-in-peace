import { TopBar, Stepper, Banner, Section, Field, Button } from "../components"
import type { ContractData } from "../types/contract"
import { formatPesos, maskIdNumber } from "../lib/formatters"

export interface ReviewProps {
  go: (n: number) => void
  activeContract: ContractData
  onSaveContract: (c: ContractData) => void
  notify: (msg: string, tone?: "success" | "error") => void
}

export function Review({
  go,
  activeContract,
  onSaveContract,
  notify,
}: ReviewProps) {
  const handleConfirm = () => {
    onSaveContract(activeContract)
    notify("Contract created successfully!", "success")
    go(8)
  }

  const rentVal = Number(activeContract.monthlyRent || 0)
  const depositVal = Number(activeContract.securityDeposit || 0)
  const advanceVal = Number(activeContract.advanceRent || 0)

  return (
    <main className="screen">
      <TopBar title="Review details" back={() => go(5)} />
      <Stepper active={1} />
      <div className="page-intro compact">
        <h1>Check everything together</h1>
        <p>A quick review now prevents mix-ups later.</p>
      </div>
      <Banner tone="info" icon="shield">
        <strong>Review every term carefully.</strong> Check all details before generating the final lease agreement.
      </Banner>
      <Section title="Landlord">
        <Field label="Full name" value={activeContract.landlordName || "Not set"} readOnly />
        <Field label="Contact number" value={activeContract.landlordContact || "Not set"} readOnly />
      </Section>
      <Section title="Tenant">
        <Field
          label="Full name"
          value={activeContract.tenantName || "Not set"}
          tag={activeContract.tenantIdNumber ? "from ID" : undefined}
          readOnly
        />
        <Field
          label="Address"
          value={activeContract.tenantAddress || "Not set"}
          tag={activeContract.tenantIdNumber ? "from ID" : undefined}
          readOnly
        />
        {activeContract.tenantIdNumber ? (
          <Field
            label="ID number"
            value={maskIdNumber(activeContract.tenantIdNumber)}
            tag="from ID"
            readOnly
          />
        ) : (
          <Field
            label="Contact number"
            value={activeContract.tenantContact || "Not set"}
            readOnly
          />
        )}
      </Section>
      <Section title="Rent">
        <div className="summary-list">
          <p>
            <span>Property</span>
            <strong>{activeContract.propertyType} · {activeContract.roomUnit || "Unit"}</strong>
          </p>
          <p>
            <span>Monthly rent</span>
            <strong>{formatPesos(rentVal)}</strong>
          </p>
          <p>
            <span>Deposit + advance</span>
            <strong>{formatPesos(depositVal + advanceVal)}</strong>
          </p>
          <p>
            <span>Term</span>
            <strong>{activeContract.duration} · Due {activeContract.dueDate}</strong>
          </p>
        </div>
      </Section>
      <Section title="Utilities">
        <div className="summary-list">
          <p>
            <span>Electricity</span>
            <strong>{activeContract.electricityType}</strong>
          </p>
          <p>
            <span>Water</span>
            <strong>{activeContract.waterType}</strong>
          </p>
        </div>
      </Section>
      <div className="bottom-action dual">
        <Button variant="secondary" onClick={() => go(5)}>
          Edit details
        </Button>
        <Button onClick={handleConfirm}>Looks good, create contract</Button>
      </div>
    </main>
  )
}
