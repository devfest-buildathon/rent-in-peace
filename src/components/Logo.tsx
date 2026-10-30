export function BrandMark() {
  return (
    <svg
      className="brand-mark"
      viewBox="0 0 52 52"
      role="img"
      aria-label="Rent in Peace house monogram"
    >
      <rect className="brand-tile" x="2" y="2" width="48" height="48" rx="15" />
      <path
        className="brand-monogram"
        d="M13.5 39V24L25.5 13 39 24M14 24h13.5c6.4 0 10.5 2.7 10.5 7.2 0 4.6-4.1 7.3-10.5 7.3H14m14.5 0L39 45"
      />
      <circle className="brand-door" cx="22" cy="31.5" r="2.5" />
    </svg>
  )
}

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`logo ${compact ? "logo-compact" : ""}`}>
      <div className="logo-mark">
        <BrandMark />
      </div>
      <div>
        <strong>
          Rent in <em>Peace</em>
        </strong>
        {!compact && <span>Good contracts make good neighbors.</span>}
      </div>
    </div>
  )
}
