import type { UserRole } from "../types/session"

export type AppRoute =
  | "/"
  | "/welcome"
  | "/landlord/signin"
  | "/landlord/signup"
  | "/landlord/dashboard"
  | "/landlord/contract/property-type"
  | "/landlord/contract/details"
  | "/landlord/contract/id-scan"
  | "/landlord/contract/review"
  | "/landlord/contract/preview"
  | "/landlord/contract/smart-check"
  | "/landlord/contract/success"
  | "/landlord/contract/share"
  | "/landlord/tenants"
  | "/landlord/tenant-detail"
  | "/landlord/reminders"
  | "/landlord/settings"
  | "/landlord/privacy"
  | "/tenant/join"
  | "/tenant/details"
  | "/tenant/home"
  | "/tenant/sign"
  | "/tenant/contract"
  | "/not-found"

export interface ParsedRoute {
  path: AppRoute | string
  params: Record<string, string>
  isValid: boolean
  requiredRole: UserRole | "public"
}

export const VALID_ROUTES: Record<string, { requiredRole: UserRole | "public"; label: string }> = {
  "/": { requiredRole: "public", label: "Welcome" },
  "/welcome": { requiredRole: "public", label: "Welcome" },
  "/not-found": { requiredRole: "public", label: "Page Not Found" },

  // Landlord routes
  "/landlord/signin": { requiredRole: "landlord", label: "Landlord Sign In" },
  "/landlord/signup": { requiredRole: "landlord", label: "Landlord Sign Up" },
  "/landlord/dashboard": { requiredRole: "landlord", label: "Landlord Dashboard" },
  "/landlord/contract/property-type": { requiredRole: "landlord", label: "Select Property" },
  "/landlord/contract/details": { requiredRole: "landlord", label: "Contract Details" },
  "/landlord/contract/id-scan": { requiredRole: "landlord", label: "Scan ID" },
  "/landlord/contract/review": { requiredRole: "landlord", label: "Review Contract" },
  "/landlord/contract/preview": { requiredRole: "landlord", label: "Contract Preview" },
  "/landlord/contract/smart-check": { requiredRole: "landlord", label: "Smart Check" },
  "/landlord/contract/success": { requiredRole: "landlord", label: "Contract Ready" },
  "/landlord/contract/share": { requiredRole: "landlord", label: "Share with Tenant" },
  "/landlord/tenants": { requiredRole: "landlord", label: "My Tenants" },
  "/landlord/tenant-detail": { requiredRole: "landlord", label: "Tenant Detail" },
  "/landlord/reminders": { requiredRole: "landlord", label: "Rent Reminders" },
  "/landlord/settings": { requiredRole: "landlord", label: "Account Settings" },
  "/landlord/privacy": { requiredRole: "landlord", label: "Privacy & Help" },

  // Tenant routes
  "/tenant/join": { requiredRole: "tenant", label: "Join by Code" },
  "/tenant/details": { requiredRole: "tenant", label: "Confirm Tenant Details" },
  "/tenant/home": { requiredRole: "tenant", label: "Tenant Home" },
  "/tenant/sign": { requiredRole: "tenant", label: "Sign Contract" },
  "/tenant/contract": { requiredRole: "tenant", label: "Signed Contract" },
}

/**
 * Parses a hash or pathname into path and query params.
 * e.g. "#/tenant/join?code=CDO-4921" -> { path: "/tenant/join", params: { code: "CDO-4921" } }
 */
export function parseRoute(rawLocation: string): ParsedRoute {
  let clean = rawLocation.trim()
  if (clean.startsWith("#")) clean = clean.slice(1)
  if (!clean || clean === "/") clean = "/"

  const [pathname, search] = clean.split("?")
  const params: Record<string, string> = {}
  if (search) {
    const searchParams = new URLSearchParams(search)
    searchParams.forEach((val, key) => {
      params[key] = val
    })
  }

  const routeConfig = VALID_ROUTES[pathname]
  if (!routeConfig) {
    return {
      path: "/not-found",
      params,
      isValid: false,
      requiredRole: "public",
    }
  }

  return {
    path: pathname as AppRoute,
    params,
    isValid: true,
    requiredRole: routeConfig.requiredRole,
  }
}

/**
 * Checks if the current role is authorized to view the requested route.
 * Rule: A tenant can only reach tenant screens, and a landlord cannot reach tenant screens.
 */
export function isRouteAuthorized(route: ParsedRoute, currentRole: UserRole): boolean {
  if (route.requiredRole === "public") return true
  if (route.requiredRole === "landlord") {
    // If user has not picked a role yet but visits landlord route, allow if not explicitly tenant
    return currentRole !== "tenant"
  }
  if (route.requiredRole === "tenant") {
    // If user has not picked a role yet but visits tenant route, allow if not explicitly landlord
    return currentRole !== "landlord"
  }
  return false
}

