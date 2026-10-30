import type { ReactNode, CSSProperties } from "react"
import { Icon, type IconName } from "./Icons"

export interface ButtonProps {
  children: ReactNode
  variant?: "primary" | "secondary" | "ghost" | "soft" | "danger"
  icon?: IconName
  onClick?: () => void
  full?: boolean
  style?: CSSProperties
  className?: string
  type?: "button" | "submit" | "reset"
  disabled?: boolean
  ariaLabel?: string
}

export function Button({
  children,
  variant = "primary",
  icon,
  onClick,
  full = true,
  style,
  className = "",
  type = "button",
  disabled = false,
  ariaLabel,
}: ButtonProps) {
  const isDanger = variant === "danger"
  const variantClass = isDanger ? "btn-danger" : `btn-${variant}`
  const fullClass = full ? "btn-full" : ""

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${fullClass} ${className}`.trim()}
      onClick={onClick}
      style={style}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {icon && <Icon name={icon} />}
      {children}
    </button>
  )
}
