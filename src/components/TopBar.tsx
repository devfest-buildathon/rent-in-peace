import type { ReactNode } from "react"
import { Logo } from "./Logo"

export interface TopBarProps {
  title?: string
  back?: () => void
  right?: ReactNode
}

export function TopBar({ title, back, right }: TopBarProps) {
  return (
    <div className="topbar">
      {back ? (
        <button className="icon-btn" onClick={back} aria-label="Go back">
          ‹
        </button>
      ) : (
        <Logo compact />
      )}
      <strong>{title}</strong>
      <div className="topbar-right">{right}</div>
    </div>
  )
}
