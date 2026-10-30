import { TopBar, Stepper, Button, Icon, type IconName } from "../components"
import type { ContractData } from "../types/contract"

export interface PropertyTypeProps {
  go: (n: number) => void
  activeContract: ContractData
  updateActiveContract: (fields: Partial<ContractData>) => void
}

export function PropertyType({
  go,
  activeContract,
  updateActiveContract,
}: PropertyTypeProps) {
  const options: [IconName, string, string][] = [
    ["house", "Boarding House / Bedspace", "A room or shared sleeping space"],
    ["home", "Apartment Unit", "A private unit in a small building"],
    ["document", "Condo", "A privately owned condominium unit"],
  ]

  return (
    <main className="screen">
      <TopBar
        back={() => go(3)}
        right={
          <button className="help-button" onClick={() => go(13)} aria-label="Help">
            <Icon name="help" /> Help
          </button>
        }
      />
      <Stepper active={0} />
      <div className="page-intro">
        <span className="eyebrow">PROPERTY DETAILS</span>
        <h1>What are you renting out?</h1>
        <p>Pick the option that best fits the property.</p>
      </div>
      <div className="select-cards">
        {options.map(([icon, title, note]) => {
          const isSelected = activeContract.propertyType === title
          return (
            <button
              type="button"
              className={`select-card ${isSelected ? "selected" : ""}`}
              onClick={() => updateActiveContract({ propertyType: title })}
              key={title}
              aria-label={`Select ${title}`}
            >
              <span className="select-icon">
                <Icon name={icon} />
              </span>
              <span>
                <strong>{title}</strong>
                <small>{note}</small>
              </span>
              <i>{isSelected && <Icon name="check" size={14} />}</i>
            </button>
          )
        })}
      </div>
      <div className="bottom-action">
        <Button onClick={() => go(5)}>
          Continue <Icon name="arrow" />
        </Button>
      </div>
    </main>
  )
}
