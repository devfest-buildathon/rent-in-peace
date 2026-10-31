import { useState, useCallback } from "react"
import { Logo, Icon } from "./components"
import {
  Welcome,
  SignIn,
  SignUp,
  Dashboard,
  PropertyType,
  ContractDetails,
  IdScan,
  Review,
  ContractPreview,
  SmartCheck,
  Success,
  MyTenants,
  TenantDetail,
  PrivacyHelp,
  AccountSettings,
  RentReminders,
  NotFound,
  TenantJoin,
} from "./screens"
import type { ContractData } from "./types"
import type { AppRoute } from "./lib/router"
import { SCREENS, createEmptyContract } from "./lib/constants"
import { useNotice } from "./hooks/useNotice"
import { useSession } from "./hooks/useSession"
import { useRoleRouter } from "./hooks/useRoleRouter"

const INDEX_TO_ROUTE: Record<number, AppRoute> = {
  0: "/welcome",
  1: "/landlord/signin",
  2: "/landlord/signup",
  3: "/landlord/dashboard",
  4: "/landlord/contract/property-type",
  5: "/landlord/contract/details",
  6: "/landlord/contract/id-scan",
  7: "/landlord/contract/review",
  8: "/landlord/contract/preview",
  9: "/landlord/contract/smart-check",
  10: "/landlord/contract/success",
  11: "/landlord/tenants",
  12: "/landlord/tenant-detail",
  13: "/landlord/privacy",
  14: "/landlord/settings",
  15: "/landlord/reminders",
  16: "/tenant/join",
  17: "/not-found",
}

const ROUTE_TO_INDEX: Record<string, number> = Object.entries(INDEX_TO_ROUTE).reduce(
  (acc, [idx, route]) => {
    acc[route] = Number(idx)
    return acc
  },
  {} as Record<string, number>
)

export function App() {
  const session = useSession()
  const router = useRoleRouter(session.role)
  const { notice, notify } = useNotice()

  const [contracts, setContracts] = useState<ContractData[]>(() => {
    try {
      const saved = localStorage.getItem("rip_saved_contracts")
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [activeContract, setActiveContract] = useState<ContractData>(() =>
    createEmptyContract(session.user)
  )
  const [selectedContract, setSelectedContract] = useState<ContractData | null>(null)

  const go = useCallback(
    (n: number) => {
      const targetRoute = INDEX_TO_ROUTE[n] || "/not-found"
      router.navigate(targetRoute)
    },
    [router]
  )

  const handleSelectLandlord = useCallback(() => {
    session.setRole("landlord")
    if (session.isAuthenticated) {
      router.navigate("/landlord/dashboard")
    } else {
      router.navigate("/landlord/signin")
    }
  }, [session, router])

  const handleSelectTenant = useCallback(() => {
    session.setRole("tenant")
    router.navigate("/tenant/join")
  }, [session, router])

  const handleLogin = useCallback(
    async (credentials: { mobile: string; password: string; remember?: boolean }) => {
      const result = await session.login(credentials)
      if (result.success) {
        const loggedUser = result.user || { name: "Landlord", mobile: credentials.mobile }
        setActiveContract((prev) => ({
          ...prev,
          landlordName: loggedUser.name,
          landlordContact: loggedUser.mobile,
        }))
        notify(`Signed in as ${loggedUser.name}.`, "success")
        router.navigate("/landlord/dashboard")
      }
      return result
    },
    [session, router, notify]
  )

  const handleRegister = useCallback(
    async (data: { name: string; mobile: string; password: string }) => {
      const result = await session.register(data)
      if (result.success) {
        const registeredUser = result.user || { name: data.name || "Landlord", mobile: data.mobile }
        setActiveContract((prev) => ({
          ...prev,
          landlordName: registeredUser.name,
          landlordContact: registeredUser.mobile,
        }))
        notify(`Account created for ${registeredUser.name}.`, "success")
        router.navigate("/landlord/dashboard")
      }
      return result
    },
    [session, router, notify]
  )

  const handleOfflineLogin = useCallback(
    (profile: { name: string; mobile: string }) => {
      session.loginOffline(profile)
      setActiveContract((prev) => ({
        ...prev,
        landlordName: profile.name,
        landlordContact: profile.mobile,
      }))
      notify(`Entered as ${profile.name} (Offline Preview).`, "success")
      router.navigate("/landlord/dashboard")
    },
    [session, router, notify]
  )

  const handleSignOut = useCallback(async () => {
    await session.logout()
    notify("Signed out successfully.")
    router.navigate("/welcome")
  }, [session, router, notify])

  const startNewContract = useCallback(() => {
    const fresh = createEmptyContract(session.user)
    setActiveContract(fresh)
    router.navigate("/landlord/contract/property-type")
  }, [session.user, router])

  const updateActiveContract = useCallback((fields: Partial<ContractData>) => {
    setActiveContract((prev) => ({ ...prev, ...fields }))
  }, [])

  const handleSaveContract = useCallback((savedContract: ContractData) => {
    setContracts((prev) => {
      const existingIdx = prev.findIndex((c) => c.id === savedContract.id)
      let updated: ContractData[]
      if (existingIdx >= 0) {
        updated = [...prev]
        updated[existingIdx] = savedContract
      } else {
        updated = [savedContract, ...prev]
      }
      try {
        localStorage.setItem("rip_saved_contracts", JSON.stringify(updated))
      } catch (e) {
        console.error(e)
      }
      return updated
    })
    setActiveContract(savedContract)
    setSelectedContract(savedContract)
  }, [])

  const handleDeleteContract = useCallback(
    (id: string) => {
      setContracts((prev) => {
        const updated = prev.filter((c) => c.id !== id)
        try {
          localStorage.setItem("rip_saved_contracts", JSON.stringify(updated))
        } catch (e) {
          console.error(e)
        }
        return updated
      })
      if (selectedContract?.id === id) {
        setSelectedContract(null)
      }
      notify("Tenant record deleted.")
      router.navigate("/landlord/tenants")
    },
    [selectedContract, notify, router]
  )

  const handlePrototypeScreenSelect = useCallback(
    (idx: number) => {
      const targetRoute = INDEX_TO_ROUTE[idx]
      if (!targetRoute) return

      if (targetRoute.startsWith("/landlord/")) {
        session.setRole("landlord")
      } else if (targetRoute.startsWith("/tenant/")) {
        session.setRole("tenant")
      }
      router.navigate(targetRoute)
    },
    [session, router]
  )

  const currentContractForView = selectedContract || activeContract
  const activeScreenIndex = ROUTE_TO_INDEX[router.currentPath] ?? 17

  // Render current screen based on role router path
  const renderCurrentScreen = () => {
    switch (router.currentPath) {
      case "/":
      case "/welcome":
        return (
          <Welcome
            onSelectLandlord={handleSelectLandlord}
            onSelectTenant={handleSelectTenant}
            user={session.user}
            onContinueLandlord={() => router.navigate("/landlord/dashboard")}
          />
        )

      case "/landlord/signin":
        return (
          <SignIn
            onLogin={handleLogin}
            onOfflineLogin={handleOfflineLogin}
            onNavigateSignUp={() => router.navigate("/landlord/signup")}
            onBack={() => {
              session.setRole(null)
              router.navigate("/welcome")
            }}
            notify={notify}
            isLoading={session.isLoading}
            apiError={session.error}
          />
        )

      case "/landlord/signup":
        return (
          <SignUp
            onRegister={handleRegister}
            onOfflineLogin={handleOfflineLogin}
            onNavigateSignIn={() => router.navigate("/landlord/signin")}
            onBack={() => {
              session.setRole(null)
              router.navigate("/welcome")
            }}
            notify={notify}
            isLoading={session.isLoading}
            apiError={session.error}
          />
        )

      case "/landlord/dashboard":
        return (
          <Dashboard
            go={go}
            notify={notify}
            user={session.user}
            contracts={contracts}
            onSelectContract={setSelectedContract}
            onNewContract={startNewContract}
          />
        )

      case "/landlord/contract/property-type":
        return (
          <PropertyType
            go={go}
            activeContract={activeContract}
            updateActiveContract={updateActiveContract}
          />
        )

      case "/landlord/contract/details":
        return (
          <ContractDetails
            go={go}
            notify={notify}
            activeContract={activeContract}
            updateActiveContract={updateActiveContract}
          />
        )

      case "/landlord/contract/id-scan":
        return (
          <IdScan
            go={go}
            notify={notify}
            updateActiveContract={updateActiveContract}
          />
        )

      case "/landlord/contract/review":
        return (
          <Review
            go={go}
            notify={notify}
            activeContract={activeContract}
            onSaveContract={handleSaveContract}
          />
        )

      case "/landlord/contract/preview":
        return (
          <ContractPreview
            go={go}
            notify={notify}
            contract={currentContractForView}
            onUpdateContract={handleSaveContract}
          />
        )

      case "/landlord/contract/smart-check":
        return (
          <SmartCheck
            go={go}
            notify={notify}
            contract={activeContract}
            updateContract={updateActiveContract}
          />
        )

      case "/landlord/contract/success":
        return (
          <Success
            go={go}
            notify={notify}
            contract={currentContractForView}
          />
        )

      case "/landlord/tenants":
        return (
          <MyTenants
            go={go}
            contracts={contracts}
            onSelectContract={setSelectedContract}
            startNewContract={startNewContract}
          />
        )

      case "/landlord/tenant-detail":
        return (
          <TenantDetail
            go={go}
            notify={notify}
            contract={selectedContract || contracts[0] || null}
            onDeleteContract={handleDeleteContract}
            onSelectContract={setSelectedContract}
          />
        )

      case "/landlord/privacy":
        return <PrivacyHelp go={go} />

      case "/landlord/settings":
        return (
          <AccountSettings
            go={go}
            notify={notify}
            user={session.user}
            onSignOut={handleSignOut}
          />
        )

      case "/landlord/reminders":
        return (
          <RentReminders
            go={go}
            notify={notify}
            contracts={contracts}
          />
        )

      case "/tenant/join":
        return (
          <TenantJoin
            initialCode={router.routeParams.code || ""}
            onBack={() => {
              session.setRole(null)
              router.navigate("/welcome")
            }}
            notify={notify}
          />
        )

      case "/not-found":
      default:
        return (
          <NotFound
            reason={router.mismatchReason}
            currentRole={session.role}
            onGoHome={() => {
              session.setRole(null)
              router.navigate("/welcome")
            }}
            onSwitchRole={(newRole) => {
              session.setRole(newRole)
              if (newRole === "landlord") {
                router.navigate("/landlord/signin")
              } else {
                router.navigate("/tenant/join")
              }
            }}
          />
        )
    }
  }

  return (
    <div className="prototype">
      <aside className="screen-nav">
        <div>
          <Logo compact />
          <p>Mobile app prototype</p>
          <div
            style={{
              marginTop: "0.5rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "2px 8px",
              borderRadius: "999px",
              fontSize: "0.7rem",
              fontWeight: 600,
              background:
                session.role === "landlord"
                  ? "#dcfce7"
                  : session.role === "tenant"
                  ? "#dbeafe"
                  : "#f3f4f6",
              color:
                session.role === "landlord"
                  ? "#166534"
                  : session.role === "tenant"
                  ? "#1e40af"
                  : "#4b5563",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background:
                  session.role === "landlord"
                    ? "#16a34a"
                    : session.role === "tenant"
                    ? "#2563eb"
                    : "#9ca3af",
              }}
            />
            {session.role === "landlord"
              ? "Landlord Active"
              : session.role === "tenant"
              ? "Tenant Active"
              : "No Role Active"}
          </div>
        </div>
        <ol>
          {SCREENS.map((name, i) => (
            <li key={name}>
              <button
                className={activeScreenIndex === i ? "active" : ""}
                onClick={() => handlePrototypeScreenSelect(i)}
                aria-label={`Navigate to screen: ${name}`}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                {name}
              </button>
            </li>
          ))}
        </ol>
        <small>390 × 844 · Role-based flow</small>
      </aside>
      <div className="phone-shell">
        <div className="statusbar" role="region" aria-label="Status Bar">
          <span>9:41</span>
          <span>● ◒ ▰</span>
        </div>
        {renderCurrentScreen()}
        {notice && (
          <div
            className={`app-toast ${notice.tone === "error" ? "toast-error" : ""}`}
            role="status"
            aria-live="polite"
          >
            <Icon name={notice.tone === "error" ? "warning" : "check"} size={16} />
            {notice.text}
          </div>
        )}
        <div className="home-indicator" />
      </div>
    </div>
  )
}

export default App
