import { useState, useEffect, useCallback } from "react"
import type { UserRole } from "../types/session"
import { parseRoute, isRouteAuthorized, type AppRoute } from "../lib/router"

export interface RoleRouterOptions {
  role: UserRole
  onRoleMismatch?: (attemptedPath: string, role: UserRole) => void
}

export function useRoleRouter(role: UserRole) {
  const [currentPath, setCurrentPath] = useState<AppRoute>(() => {
    const parsed = parseRoute(window.location.hash || window.location.pathname)
    if (!isRouteAuthorized(parsed, role)) {
      return "/not-found"
    }
    return parsed.path as AppRoute
  })

  const [routeParams, setRouteParams] = useState<Record<string, string>>(() => {
    return parseRoute(window.location.hash || window.location.pathname).params
  })

  const [mismatchReason, setMismatchReason] = useState<string | null>(null)

  const navigate = useCallback(
    (to: string) => {
      const parsed = parseRoute(to)

      if (!parsed.isValid) {
        setMismatchReason(`The page "${to}" does not exist.`)
        setCurrentPath("/not-found")
        setRouteParams(parsed.params)
        window.location.hash = "/not-found"
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }

      if (!isRouteAuthorized(parsed, role)) {
        const reason =
          role === "tenant"
            ? "Tenants cannot access landlord management or contract drafting screens."
            : "Landlords cannot open tenant-only signing and invite screens directly."
        setMismatchReason(reason)
        setCurrentPath("/not-found")
        setRouteParams(parsed.params)
        window.location.hash = "/not-found"
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }

      setMismatchReason(null)
      setCurrentPath(parsed.path as AppRoute)
      setRouteParams(parsed.params)
      window.location.hash = to
      window.scrollTo({ top: 0, behavior: "smooth" })
    },
    [role]
  )

  // Listen to browser hash changes (e.g. back/forward button or external links)
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseRoute(window.location.hash)
      if (!parsed.isValid) {
        setMismatchReason(`The page "${window.location.hash}" does not exist.`)
        setCurrentPath("/not-found")
        setRouteParams(parsed.params)
        return
      }

      if (!isRouteAuthorized(parsed, role)) {
        const reason =
          role === "tenant"
            ? "Tenants cannot access landlord management or contract drafting screens."
            : "Landlords cannot open tenant-only signing and invite screens directly."
        setMismatchReason(reason)
        setCurrentPath("/not-found")
        setRouteParams(parsed.params)
        return
      }

      setMismatchReason(null)
      setCurrentPath(parsed.path as AppRoute)
      setRouteParams(parsed.params)
    }

    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [role])

  return {
    currentPath,
    routeParams,
    mismatchReason,
    navigate,
  }
}

