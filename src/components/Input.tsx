import { useState, type ChangeEvent, type ReactNode } from "react"
import { Icon } from "./Icons"

export interface FieldProps {
  label: string
  value: string
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  type?: string
  readOnly?: boolean
  hint?: string
  tag?: string
  error?: string
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  readOnly = false,
  hint,
  tag,
  error,
}: FieldProps) {
  return (
    <label className={`field ${error ? "field-error" : ""}`}>
      <span>
        {label}
        {tag && <em>{tag}</em>}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
      />
      <small>{error || hint}</small>
    </label>
  )
}

export interface SelectFieldProps {
  label: string
  value: string
  onChange?: (val: string) => void
  options?: string[]
  hint?: string
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
}: SelectFieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      {options && options.length > 0 && onChange ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <div className="select-value">
          {value}
          <Icon name="chevron" size={16} />
        </div>
      )}
      {hint && <small>{hint}</small>}
    </label>
  )
}

export function Section({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="form-section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

export interface AuthInputProps {
  label: string
  placeholder: string
  type?: string
  value?: string
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  error?: string
  hint?: string
  inputMode?: "text" | "numeric" | "tel" | "search" | "email" | "url"
  maxLength?: number
  disabled?: boolean
  autoCapitalize?: string
}

export function AuthInput({
  label,
  placeholder,
  type = "text",
  value = "",
  onChange,
  error,
  hint,
  inputMode,
  maxLength,
  disabled = false,
  autoCapitalize,
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === "password"
  const resolvedType = isPassword ? (showPassword ? "text" : "password") : type

  return (
    <div className={`auth-field ${error ? "has-error" : ""}`}>
      <span>{label}</span>
      <div className="auth-input-wrapper">
        <input
          type={resolvedType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          inputMode={inputMode}
          maxLength={maxLength}
          disabled={disabled}
          autoCapitalize={autoCapitalize}
        />
        {isPassword && (
          <button
            type="button"
            className="password-toggle-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error ? (
        <span className="auth-error-text">{error}</span>
      ) : hint ? (
        <span className="auth-hint-text">{hint}</span>
      ) : null}
    </div>
  )
}
