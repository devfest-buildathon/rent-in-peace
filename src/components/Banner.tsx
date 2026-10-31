import type { ReactNode } from "react"
import { Icon, type IconName } from "./Icons"

export interface BannerProps {
  tone: "info" | "warning" | "success" | "danger"
  icon: IconName
  children: ReactNode
}

export function Banner({ tone, icon, children }: BannerProps) {
  return (
    <div className={`banner banner-${tone}`}>
      <Icon name={icon} />
      <span>{children}</span>
    </div>
  )
}
