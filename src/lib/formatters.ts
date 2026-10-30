/**
 * Format helper functions for Rent in Peace
 */

/**
 * Format a number or numeric string as Philippine Pesos (₱)
 */
export function formatPesos(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || amount === "") return "₱0"
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(num)) return "₱0"
  return `₱${num.toLocaleString("en-PH")}`
}

/**
 * Mask an identification card or number, showing only the last 4 characters/digits
 * Example: "CRN-1984-2849201" -> "•••• •••• 9201"
 */
export function maskIdNumber(idNumber: string | undefined | null): string {
  if (!idNumber) return ""
  const clean = idNumber.trim()
  if (clean.length <= 4) return clean
  const lastFour = clean.slice(-4)
  return `•••• •••• ${lastFour}`
}

/**
 * Sanitize input to allow letters, spaces, hyphens, and apostrophes only
 */
export function sanitizeLettersOnly(value: string): string {
  return value.replace(/[0-9]/g, "")
}

/**
 * Sanitize input to digits only with optional max length
 */
export function sanitizeDigitsOnly(value: string, maxLength?: number): string {
  const digits = value.replace(/\D/g, "")
  return maxLength ? digits.slice(0, maxLength) : digits
}

/**
 * Form validation functions
 */
export function validateName(name: string): { isValid: boolean; error: string } {
  const trimmed = name.trim()
  if (!trimmed) {
    return { isValid: false, error: "Full name is required." }
  }
  if (/\d/.test(name)) {
    return { isValid: false, error: "Name cannot contain numbers." }
  }
  if (trimmed.length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters." }
  }
  if (!/^[a-zA-Z\s\-\'\.]+$/.test(trimmed)) {
    return { isValid: false, error: "Name must contain letters only." }
  }
  return { isValid: true, error: "" }
}

export function validateMobile(mobile: string): { isValid: boolean; error: string } {
  const trimmed = mobile.trim()
  if (!trimmed) {
    return { isValid: false, error: "Mobile number is required." }
  }
  if (!/^\d+$/.test(trimmed)) {
    return { isValid: false, error: "Only numbers are allowed." }
  }
  if (trimmed.length < 10 || trimmed.length > 11) {
    return { isValid: false, error: "Mobile number must be 11 digits (e.g. 09171234567)." }
  }
  return { isValid: true, error: "" }
}

export function validatePassword(pass: string): {
  isValid: boolean
  hasMinLength: boolean
  hasUpper: boolean
  hasLower: boolean
  hasNumber: boolean
  hasSpecial: boolean
  error: string
} {
  const hasMinLength = pass.length >= 8
  const hasUpper = /[A-Z]/.test(pass)
  const hasLower = /[a-z]/.test(pass)
  const hasNumber = /[0-9]/.test(pass)
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(pass)
  const isValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial

  let error = ""
  if (!pass) {
    error = "Password is required."
  } else if (!hasMinLength) {
    error = "Password must be at least 8 characters."
  } else if (!hasUpper) {
    error = "Must include at least 1 capital letter (A-Z)."
  } else if (!hasLower) {
    error = "Must include at least 1 small letter (a-z)."
  } else if (!hasNumber) {
    error = "Must include at least 1 number (0-9)."
  } else if (!hasSpecial) {
    error = "Must include at least 1 special character (!@#$%...)."
  }

  return {
    isValid,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    error,
  }
}
