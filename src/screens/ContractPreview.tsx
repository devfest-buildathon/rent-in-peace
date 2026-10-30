import { useState, useEffect } from "react"
import { TopBar, Stepper, Button, ContractSheet } from "../components"
import type { ContractData, ContractSection } from "../types/contract"
import { getContractSections } from "../lib/constants"

export interface ContractPreviewProps {
  go: (n: number) => void
  notify: (message: string, tone?: "success" | "error") => void
  contract: ContractData
  onUpdateContract?: (updated: ContractData) => void
}

export function ContractPreview({
  go,
  notify,
  contract,
  onUpdateContract,
}: ContractPreviewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [docTitle, setDocTitle] = useState(contract.title || "KASULATAN SA PAG-ABANG")
  const [sections, setSections] = useState<ContractSection[]>(() =>
    getContractSections(contract)
  )

  useEffect(() => {
    setSections(getContractSections(contract))
    setDocTitle(contract.title || "KASULATAN SA PAG-ABANG")
  }, [contract])

  const handleTitleChange = (val: string) => {
    setDocTitle(val)
  }

  const handleSectionTitleChange = (idx: number, newTitle: string) => {
    setSections((prev) =>
      prev.map((s, i) => (i === idx ? [newTitle, s[1]] : s))
    )
  }

  const handleSectionBodyChange = (idx: number, newBody: string) => {
    setSections((prev) =>
      prev.map((s, i) => (i === idx ? [s[0], newBody] : s))
    )
  }

  const handleRemoveSection = (idx: number) => {
    setSections((prev) => prev.filter((_, i) => i !== idx))
    notify("Clause removed from contract.")
  }

  const handleAddSection = () => {
    const nextNum = sections.length + 1
    setSections((prev) => [
      ...prev,
      [`${nextNum}. Additional Agreed Terms`, "Specify any additional rules, inventory, or conditions agreed upon."],
    ])
    notify("New clause added.")
  }

  const savePaperEdits = () => {
    if (onUpdateContract) {
      onUpdateContract({
        ...contract,
        title: docTitle,
        customSections: sections,
      })
    }
    setIsEditing(false)
    notify("Contract paper updated and saved!", "success")
  }

  return (
    <main className="screen paper-bg">
      <TopBar
        title="Contract preview"
        back={() => go(7)}
        right={
          <button
            className="icon-btn"
            style={{ fontSize: "11px", fontWeight: "700", width: "auto", padding: "4px 10px" }}
            onClick={() => {
              if (isEditing) {
                savePaperEdits()
              } else {
                setIsEditing(true)
              }
            }}
            aria-label={isEditing ? "Save contract edits" : "Edit contract paper"}
          >
            {isEditing ? "Save" : "Edit"}
          </button>
        }
      />
      <Stepper active={2} />

      <ContractSheet
        contract={contract}
        sections={sections}
        docTitle={docTitle}
        isEditing={isEditing}
        onTitleChange={handleTitleChange}
        onSectionTitleChange={handleSectionTitleChange}
        onSectionBodyChange={handleSectionBodyChange}
        onRemoveSection={handleRemoveSection}
        onAddSection={handleAddSection}
        onDoneEditing={savePaperEdits}
      />

      <div className="sticky-tools">
        <Button
          variant="secondary"
          icon="document"
          full={false}
          onClick={() => {
            window.print()
            notify("Print / PDF dialog opened.")
          }}
          ariaLabel="Print or Save Contract as PDF"
        >
          Print / Save PDF
        </Button>
        <Button
          variant={isEditing ? "primary" : "soft"}
          icon="document"
          full={false}
          onClick={() => {
            if (isEditing) {
              savePaperEdits()
            } else {
              setIsEditing(true)
            }
          }}
          ariaLabel={isEditing ? "Save Edits" : "Edit Paper"}
        >
          {isEditing ? "Save Edits" : "Edit Paper"}
        </Button>
        <Button
          variant="soft"
          icon="sparkle"
          full={false}
          onClick={() => go(9)}
          ariaLabel="Run Smart Check"
        >
          Smart Check
        </Button>
        <Button
          variant="primary"
          icon="check"
          full={false}
          onClick={() => {
            if (isEditing) savePaperEdits()
            go(10)
          }}
          ariaLabel="Finish and sign contract"
        >
          Finish & Sign
        </Button>
      </div>
    </main>
  )
}
