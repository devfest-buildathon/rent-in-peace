import type { ReactNode } from "react"
import { Icon, type IconName } from "./Icons"

export function MiniCard({
  icon,
  title,
  subtitle,
}: {
  icon: IconName
  title: string
  subtitle: string
}) {
  return (
    <div className="mini-card">
      <Icon name={icon} />
      <strong>{title}</strong>
      <small>{subtitle}</small>
    </div>
  )
}

export function SelectCard({
  icon,
  title,
  description,
  isSelected,
  onClick,
}: {
  icon: IconName
  title: string
  description: string
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={`select-card ${isSelected ? "selected" : ""}`}
      onClick={onClick}
    >
      <div className="select-icon">
        <Icon name={icon} />
      </div>
      <div>
        <strong>{title}</strong>
        <small>{description}</small>
      </div>
      <span className="radio-dot">
        <span />
      </span>
    </button>
  )
}

export function ReminderCard({
  title,
  details,
  active,
  onToggle,
}: {
  title: string
  details: string
  active: boolean
  onToggle: () => void
}) {
  return (
    <div className="reminder-card">
      <div className="reminder-icon">
        <Icon name="bell" />
      </div>
      <div>
        <strong>{title}</strong>
        <small>{details}</small>
      </div>
      <button
        type="button"
        className={`toggle ${active ? "on" : ""}`}
        onClick={onToggle}
        aria-label={`Toggle reminder: ${title}`}
      >
        <span />
      </button>
    </div>
  )
}

export function TenantCard({
  tenantName,
  roomUnit,
  propertyType,
  rentFormatted,
  dueDate,
  status,
  onClick,
}: {
  tenantName: string
  roomUnit: string
  propertyType: string
  rentFormatted: string
  dueDate: string
  status: string
  onClick: () => void
}) {
  const initials = tenantName
    ? tenantName
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "T"

  return (
    <button type="button" className="tenant-card" onClick={onClick}>
      <span className="tenant-avatar">{initials}</span>
      <span className="tenant-main">
        <strong>{tenantName || "Unnamed Tenant"}</strong>
        <small>
          {roomUnit ? `${roomUnit} · ` : ""}
          {propertyType}
        </small>
      </span>
      <span className="tenant-side">
        <b>₱{rentFormatted}</b>
        <small>{dueDate}</small>
        <span className={`status-pill status-${status.toLowerCase()}`}>
          {status}
        </span>
      </span>
    </button>
  )
}
