import type { ReactNode } from "react"

export interface ChipProps {
  children: ReactNode
  tone?: "warn" | "good" | "neutral"
  className?: string
}

export function Chip({ children, tone = "neutral", className = "" }: ChipProps) {
  const toneClass = tone === "warn" ? "chip-warn" : tone === "good" ? "chip-good" : ""
  return <span className={`chip ${toneClass} ${className}`.trim()}>{children}</span>
}
