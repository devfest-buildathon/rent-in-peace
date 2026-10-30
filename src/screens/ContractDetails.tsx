import { TopBar, Stepper, Button, Field, SelectField, Section, Icon } from "../components"
import type { ContractData } from "../types/contract"

export interface ContractDetailsProps {
  go: (n: number) => void
  notify: (message: string, tone?: "success" | "error") => void
  activeContract: ContractData
  updateActiveContract: (fields: Partial<ContractData>) => void
}

export function ContractDetails({
  go,
  notify,
  activeContract,
  updateActiveContract,
}: ContractDetailsProps) {
  const handleProceed = () => {
    if (!activeContract.tenantName.trim()) {
      notify("Please enter the tenant's full name.", "error")
      return
    }
    if (!activeContract.roomUnit.trim()) {
      notify("Please enter the room or unit.", "error")
      return
    }
    if (!activeContract.monthlyRent.trim() || Number(activeContract.monthlyRent) <= 0) {
      notify("Please enter a valid monthly rent amount.", "error")
      return
    }
    go(7)
  }

  return (
    <main className="screen">
      <TopBar title="Contract details" back={() => go(4)} />
      <Stepper active={0} />
      <div className="page-intro compact">
        <h1>Tell us the basics</h1>
        <p>We’ll use these details to prepare your contract.</p>
      </div>
      <Section title="Landlord">
        <Field
          label="Full name"
          value={activeContract.landlordName}
          onChange={(e) =>
            updateActiveContract({ landlordName: e.target.value.replace(/[0-9]/g, "") })
          }
          placeholder="Landlord full name"
          hint="Use the name on your valid ID."
        />
        <Field
          label="Contact number"
          value={activeContract.landlordContact}
          onChange={(e) =>
            updateActiveContract({
              landlordContact: e.target.value.replace(/\D/g, "").slice(0, 11),
            })
          }
          placeholder="09XX XXX XXXX"
          hint="For rent and contract updates."
          type="tel"
        />
      </Section>
      <Section title="Property & Unit">
        <Field
          label="Room / Unit number"
          value={activeContract.roomUnit}
          onChange={(e) => updateActiveContract({ roomUnit: e.target.value })}
          placeholder="e.g. Room 4B, Unit 201"
          hint="The specific room or unit to rent."
        />
        <Field
          label="Property address"
          value={activeContract.propertyAddress}
          onChange={(e) => updateActiveContract({ propertyAddress: e.target.value })}
          placeholder="e.g. Zone 3, Bulua, Cagayan de Oro City"
          hint="Location of the rental property."
        />
      </Section>
      <Section title="Tenant">
        <Field
          label="Full name"
          value={activeContract.tenantName}
          onChange={(e) =>
            updateActiveContract({ tenantName: e.target.value.replace(/[0-9]/g, "") })
          }
          placeholder="Complete legal name (letters only)"
          hint="Use the tenant’s complete legal name."
        />
        <Field
          label="Current address"
          value={activeContract.tenantAddress}
          onChange={(e) => updateActiveContract({ tenantAddress: e.target.value })}
          placeholder="Tenant's address"
          hint="Current home address."
        />
        <Field
          label="Contact number"
          value={activeContract.tenantContact}
          onChange={(e) =>
            updateActiveContract({
              tenantContact: e.target.value.replace(/\D/g, "").slice(0, 11),
            })
          }
          placeholder="09XX XXX XXXX"
          type="tel"
          hint="Tenant's active mobile number."
        />
      </Section>
      <button className="scan-card" onClick={() => go(6)} aria-label="Scan tenant's ID">
        <span>
          <Icon name="camera" />
        </span>
        <div>
          <strong>Scan tenant’s ID to fill in details</strong>
          <small>Optional · The photo is not saved</small>
        </div>
        <Icon name="arrow" />
      </button>
      <Section title="The rent">
        <div className="field-grid">
          <Field
            label="Monthly rent (₱)"
            value={activeContract.monthlyRent}
            onChange={(e) =>
              updateActiveContract({ monthlyRent: e.target.value.replace(/\D/g, "") })
            }
            placeholder="e.g. 3500"
            type="number"
          />
          <Field
            label="Security deposit (₱)"
            value={activeContract.securityDeposit}
            onChange={(e) =>
              updateActiveContract({ securityDeposit: e.target.value.replace(/\D/g, "") })
            }
            placeholder="e.g. 7000"
            type="number"
          />
          <Field
            label="Advance (₱)"
            value={activeContract.advanceRent}
            onChange={(e) =>
              updateActiveContract({ advanceRent: e.target.value.replace(/\D/g, "") })
            }
            placeholder="e.g. 3500"
            type="number"
          />
          <SelectField
            label="Lease duration"
            value={activeContract.duration}
            onChange={(val) => updateActiveContract({ duration: val })}
            options={["1 month", "3 months", "6 months", "1 year", "2 years"]}
          />
          <Field
            label="Start date"
            value={activeContract.startDate}
            onChange={(e) => updateActiveContract({ startDate: e.target.value })}
            type="date"
          />
          <SelectField
            label="Due day each month"
            value={activeContract.dueDate}
            onChange={(val) => updateActiveContract({ dueDate: val })}
            options={[
              "Every 1st",
              "Every 5th",
              "Every 10th",
              "Every 15th",
              "Every 20th",
              "Every 25th",
              "Every 30th",
              "End of month",
            ]}
          />
        </div>
      </Section>
      <Section title="Utilities">
        <SelectField
          label="Electricity"
          value={activeContract.electricityType}
          onChange={(val) => updateActiveContract({ electricityType: val })}
          options={["Sub-meter", "Fixed monthly fee", "Included in rent", "Shared split"]}
          hint="Tenant pays based on selected option."
        />
        <Field
          label="Starting meter reading"
          value={activeContract.meterReading}
          onChange={(e) => updateActiveContract({ meterReading: e.target.value })}
          placeholder="e.g. 12458 kWh (optional)"
          hint="Optional"
        />
        <SelectField
          label="Water"
          value={activeContract.waterType}
          onChange={(val) => updateActiveContract({ waterType: val })}
          options={["Shared split", "Fixed monthly fee", "Included in rent", "Sub-meter"]}
          hint="Shared equally among occupied rooms."
        />
      </Section>
      <div className="bottom-action inline-note">
        <small>Only include details you both agreed on.</small>
        <Button onClick={handleProceed}>
          Review details <Icon name="arrow" />
        </Button>
      </div>
    </main>
  )
}
