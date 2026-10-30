import { Icon } from "./Icons"

export interface TabBarProps {
  active: number
  go: (n: number) => void
  onNewContract?: () => void
}

export function TabBar({ active, go, onNewContract }: TabBarProps) {
  return (
    <nav className="tabs" role="navigation" aria-label="Bottom Navigation">
      <button
        className={active === 0 ? "active" : ""}
        onClick={() => go(3)}
        aria-label="Home Dashboard"
      >
        <Icon name="home" />
        <span>Home</span>
      </button>
      <button
        onClick={onNewContract || (() => go(4))}
        aria-label="Create New Rental Contract"
      >
        <span className="tab-plus">
          <Icon name="plus" />
        </span>
        <b>New Contract</b>
      </button>
      <button
        className={active === 2 ? "active" : ""}
        onClick={() => go(11)}
        aria-label="My Tenants"
      >
        <Icon name="user" />
        <span>My Tenants</span>
      </button>
    </nav>
  )
}
