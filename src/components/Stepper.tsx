import { Icon } from "./Icons"

export interface StepperProps {
  active: number
  steps?: string[]
}

export function Stepper({
  active,
  steps = ["Details", "Review", "Contract", "Check"],
}: StepperProps) {
  return (
    <div className="stepper" role="navigation" aria-label="Progress">
      {steps.map((label, i) => (
        <div className={`step ${i <= active ? "active" : ""}`} key={label}>
          <span>{i < active ? <Icon name="check" size={12} /> : i + 1}</span>
          <small>{label}</small>
        </div>
      ))}
    </div>
  )
}
