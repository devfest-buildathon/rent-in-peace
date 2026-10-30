import { Logo } from "./Logo"
import { Icon } from "./Icons"
import type { ContractData, ContractSection } from "../types/contract"
import { LEGAL_DISCLAIMER } from "../lib/constants"
import { maskIdNumber } from "../lib/formatters"

export interface ContractSheetProps {
  contract: ContractData
  sections: ContractSection[]
  docTitle: string
  isEditing?: boolean
  onTitleChange?: (val: string) => void
  onSectionTitleChange?: (idx: number, val: string) => void
  onSectionBodyChange?: (idx: number, val: string) => void
  onRemoveSection?: (idx: number) => void
  onAddSection?: () => void
  onDoneEditing?: () => void
}

export function ContractSheet({
  contract,
  sections,
  docTitle,
  isEditing = false,
  onTitleChange,
  onSectionTitleChange,
  onSectionBodyChange,
  onRemoveSection,
  onAddSection,
  onDoneEditing,
}: ContractSheetProps) {
  const maskedId = maskIdNumber(contract.tenantIdNumber)

  return (
    <div className="paper">
      {isEditing && (
        <div className="paper-edit-bar">
          <span>
            <Icon name="document" size={14} /> Editing contract paper
          </span>
          {onDoneEditing && (
            <button className="paper-edit-btn" onClick={onDoneEditing}>
              Done Editing
            </button>
          )}
        </div>
      )}

      <div className="paper-logo">
        <Logo compact />
      </div>
      <p className="doc-kicker">RESIDENTIAL LEASE AGREEMENT</p>

      {isEditing && onTitleChange ? (
        <div style={{ marginBottom: "8px" }}>
          <input
            className="paper-title-input"
            value={docTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Contract title"
          />
        </div>
      ) : (
        <h1>{docTitle}</h1>
      )}

      <p className="doc-meta">
        Prepared {contract.startDate || "Current date"} · {contract.roomUnit || "Unit"}
      </p>

      {sections.map(([title, body], idx) => {
        // If the body contains the tenant ID number, display the masked version
        const displayBody =
          contract.tenantIdNumber && body.includes(contract.tenantIdNumber)
            ? body.replace(contract.tenantIdNumber, maskedId)
            : body

        return (
          <section className="contract-section" key={idx}>
            {isEditing && onSectionTitleChange && onSectionBodyChange ? (
              <div style={{ marginBottom: "12px" }}>
                <div className="section-edit-header">
                  <input
                    className="section-title-input"
                    value={title}
                    onChange={(e) => onSectionTitleChange(idx, e.target.value)}
                    placeholder="Clause Title (e.g. 1. Parties)"
                  />
                  {onRemoveSection && (
                    <button
                      className="section-delete-btn"
                      onClick={() => onRemoveSection(idx)}
                      title="Remove clause"
                      aria-label="Remove clause"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <textarea
                  className="section-body-input"
                  rows={3}
                  value={body}
                  onChange={(e) => onSectionBodyChange(idx, e.target.value)}
                  placeholder="Clause terms and description..."
                />
              </div>
            ) : (
              <>
                <h3>{title}</h3>
                <p>{displayBody}</p>
              </>
            )}
          </section>
        )
      })}

      {isEditing && onAddSection && (
        <button className="add-clause-btn" onClick={onAddSection}>
          <Icon name="plus" size={14} /> Add custom clause
        </button>
      )}

      <div className="signatures">
        {[
          `${contract.landlordName || "Landlord"} · Landlord`,
          `${contract.tenantName || "Tenant"} · Tenant`,
          "Witness 1",
          "Witness 2",
        ].map((x) => (
          <div key={x}>
            <span />
            {x}
          </div>
        ))}
      </div>
      <p className="document-note">{LEGAL_DISCLAIMER}</p>
    </div>
  )
}
