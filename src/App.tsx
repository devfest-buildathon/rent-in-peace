import { useState } from "react"
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
} from "./screens"
import type { ContractData, UserProfile } from "./types"
import { SCREENS, createEmptyContract } from "./lib/constants"
import { useNotice } from "./hooks/useNotice"

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem("rip_logged_user")
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const [screen, setScreen] = useState<number>(() => {
    try {
      const remember = localStorage.getItem("rip_remember_me") === "true"
      const hasUser = !!localStorage.getItem("rip_logged_user")
      if (remember && hasUser) {
        return 3 // Skip to Dashboard directly if account is saved
      }
    } catch {
      // fallback to initial
    }
    return 0
  })

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
    createEmptyContract(currentUser)
  )

  const [selectedContract, setSelectedContract] = useState<ContractData | null>(null)

  const go = (n: number) => {
    setScreen(n)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleLogin = (user: UserProfile, remember: boolean = true) => {
    setCurrentUser(user)
    try {
      localStorage.setItem("rip_logged_user", JSON.stringify(user))
      if (remember) {
        localStorage.setItem("rip_remember_me", "true")
        localStorage.setItem("rip_remembered_mobile", user.mobile)
      } else {
        localStorage.removeItem("rip_remember_me")
        localStorage.removeItem("rip_remembered_mobile")
      }
    } catch (e) {
      console.error(e)
    }
    setActiveContract((prev) => ({
      ...prev,
      landlordName: user.name,
      landlordContact: user.mobile,
    }))
  }

  const handleRegister = (user: UserProfile) => {
    handleLogin(user, true)
  }

  const handleSignOut = () => {
    setCurrentUser(null)
    try {
      localStorage.removeItem("rip_logged_user")
      localStorage.removeItem("rip_remember_me")
    } catch (e) {
      console.error(e)
    }
    notify("Signed out successfully.")
    go(0)
  }

  const startNewContract = () => {
    const fresh = createEmptyContract(currentUser)
    setActiveContract(fresh)
    go(4)
  }

  const updateActiveContract = (fields: Partial<ContractData>) => {
    setActiveContract((prev) => ({ ...prev, ...fields }))
  }

  const handleSaveContract = (savedContract: ContractData) => {
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
  }

  const handleDeleteContract = (id: string) => {
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
    go(11)
  }

  // Current contract to display in preview / success
  const currentContractForView = selectedContract || activeContract

  const pages = [
    <Welcome key="welcome" go={go} user={currentUser} />,
    <SignIn key="signin" go={go} notify={notify} onLogin={handleLogin} />,
    <SignUp key="signup" go={go} notify={notify} onRegister={handleRegister} />,
    <Dashboard
      key="dashboard"
      go={go}
      notify={notify}
      user={currentUser}
      contracts={contracts}
      onSelectContract={setSelectedContract}
      onNewContract={startNewContract}
    />,
    <PropertyType
      key="propertytype"
      go={go}
      activeContract={activeContract}
      updateActiveContract={updateActiveContract}
    />,
    <ContractDetails
      key="contractdetails"
      go={go}
      notify={notify}
      activeContract={activeContract}
      updateActiveContract={updateActiveContract}
    />,
    <IdScan
      key="idscan"
      go={go}
      notify={notify}
      updateActiveContract={updateActiveContract}
    />,
    <Review
      key="review"
      go={go}
      notify={notify}
      activeContract={activeContract}
      onSaveContract={handleSaveContract}
    />,
    <ContractPreview
      key="preview"
      go={go}
      notify={notify}
      contract={currentContractForView}
      onUpdateContract={handleSaveContract}
    />,
    <SmartCheck
      key="smartcheck"
      go={go}
      notify={notify}
      contract={activeContract}
      updateContract={updateActiveContract}
    />,
    <Success
      key="success"
      go={go}
      notify={notify}
      contract={currentContractForView}
    />,
    <MyTenants
      key="mytenants"
      go={go}
      contracts={contracts}
      onSelectContract={setSelectedContract}
      startNewContract={startNewContract}
    />,
    <TenantDetail
      key="tenantdetail"
      go={go}
      notify={notify}
      contract={selectedContract || contracts[0] || null}
      onDeleteContract={handleDeleteContract}
      onSelectContract={setSelectedContract}
    />,
    <PrivacyHelp key="privacyhelp" go={go} />,
    <AccountSettings
      key="accountsettings"
      go={go}
      notify={notify}
      user={currentUser}
      onSignOut={handleSignOut}
    />,
    <RentReminders
      key="rentreminders"
      go={go}
      notify={notify}
      contracts={contracts}
    />,
  ]

  return (
    <div className="prototype">
      <aside className="screen-nav">
        <div>
          <Logo compact />
          <p>Mobile app prototype</p>
        </div>
        <ol>
          {SCREENS.map((name, i) => (
            <li key={name}>
              <button
                className={screen === i ? "active" : ""}
                onClick={() => go(i)}
                aria-label={`Navigate to screen: ${name}`}
              >
                <span>{String(i + 1).padStart(2, "0")}</span>
                {name}
              </button>
            </li>
          ))}
        </ol>
        <small>390 × 844 · Interactive flow</small>
      </aside>
      <div className="phone-shell">
        <div className="statusbar" role="region" aria-label="Status Bar">
          <span>9:41</span>
          <span>● ◒ ▰</span>
        </div>
        {pages[screen]}
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
