import { useState } from "react"
import { TopBar, Stepper, Banner, Button, Icon, Chip } from "../components"
import type { ContractData } from "../types/contract"
import { DEFAULT_SUGGESTIONS } from "../lib/constants"

export interface SmartCheckProps {
  go: (n: number) => void
  contract: ContractData
  updateContract: (fields: Partial<ContractData>) => void
  notify: (message: string, tone?: "success" | "error") => void
}

export function SmartCheck({
  go,
  contract,
  updateContract,
  notify,
}: SmartCheckProps) {
  const [choices, setChoices] = useState<Record<number, "added" | "ignored">>({})

  const suggestions = DEFAULT_SUGGESTIONS

  const handleApply = () => {
    let newRules = contract.houseRules || ""
    suggestions.forEach(([_, __, clauseText], idx) => {
      if (choices[idx] === "added" && !newRules.includes(clauseText)) {
        newRules += ` ${clauseText}`
      }
    })
    updateContract({ houseRules: newRules.trim() })
    notify("Clauses added to contract!", "success")
    go(8)
  }

  return (
    <main className="screen">
      <TopBar title="Smart Check" back={() => go(8)} />
      <Stepper active={3} />
      <div className="page-intro compact">
        <div className="title-row">
          <h1>Things to double-check</h1>
          <Chip tone="warn">{suggestions.length} suggestions</Chip>
        </div>
        <p>Small details that can prevent misunderstandings.</p>
      </div>
      <div className="suggestions">
        {suggestions.map(([title, body], i) => (
          <article
            className={`suggestion ${choices[i] ? `suggestion-${choices[i]}` : ""}`}
            key={title}
          >
            <div className="suggestion-icon">
              <Icon name="warning" />
            </div>
            <div>
              <span className="suggestion-label">SUGGESTION {i + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
              <div className="suggestion-actions">
                <Button
                  variant="soft"
                  full={false}
                  icon={choices[i] === "added" ? "check" : "plus"}
                  onClick={() =>
                    setChoices((current) => ({ ...current, [i]: "added" }))
                  }
                  ariaLabel={`Add clause: ${title}`}
                >
                  {choices[i] === "added" ? "Clause added" : "Add this clause"}
                </Button>
                <Button
                  variant="ghost"
                  full={false}
                  onClick={() =>
                    setChoices((current) => ({ ...current, [i]: "ignored" }))
                  }
                  ariaLabel={`Ignore clause: ${title}`}
                >
                  {choices[i] === "ignored" ? "Ignored" : "Ignore"}
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <Banner tone="info" icon="help">
        Suggestions only. You decide what to include.
      </Banner>
      <div className="bottom-action">
        <Button onClick={handleApply}>Apply selected clauses</Button>
      </div>
    </main>
  )
}
