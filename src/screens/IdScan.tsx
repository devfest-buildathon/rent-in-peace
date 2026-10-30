import { useState, useRef, type ChangeEvent } from "react"
import { TopBar, Button, Icon, Banner } from "../components"
import type { ContractData } from "../types/contract"
import { readIdPhoto } from "../api/leaseApi"
import { maskIdNumber } from "../lib/formatters"

export interface IdScanProps {
  go: (n: number) => void
  notify: (message: string, tone?: "success" | "error") => void
  updateActiveContract: (fields: Partial<ContractData>) => void
}

export function IdScan({ go, notify, updateActiveContract }: IdScanProps) {
  const [state, setState] = useState<"ready" | "loading" | "scanned" | "error">("ready")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [scannedData, setScannedData] = useState<{
    name: string
    address: string
    idType: string
    idNumber: string
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setState("loading")
    setErrorMessage("")
    try {
      const result = await readIdPhoto(file)
      setScannedData(result)
      setState("scanned")
      notify("Tenant details recognized from ID!", "success")
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to read ID."
      setErrorMessage(msg)
      setState("error")
      notify(msg, "error")
    }
  }

  const triggerScanOrUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const applyScanned = () => {
    if (!scannedData) return
    updateActiveContract({
      tenantName: scannedData.name,
      tenantAddress: scannedData.address,
      tenantIdNumber: scannedData.idNumber,
    })
    notify("Scanned details applied to contract.", "success")
    go(5)
  }

  return (
    <main className="screen camera-screen">
      <TopBar title="Scan tenant ID" back={() => go(5)} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <div className="camera-view">
        <div className="camera-sheen" />
        <div className={`id-guide ${state}`}>
          <span />
          <span />
          <span />
          <span />
          {state === "ready" && (
            <div>
              <Icon name="camera" size={32} />
              <strong>Place the ID inside the box</strong>
              <small>Avoid glare and keep all corners visible.</small>
            </div>
          )}
          {state === "loading" && (
            <div>
              <i className="loader" />
              <strong>Reading the ID...</strong>
              <small>Connecting to OCR recognition service...</small>
            </div>
          )}
          {state === "error" && (
            <div style={{ textAlign: "center", color: "#fecdd3", padding: "0 12px" }}>
              <Icon name="warning" size={32} />
              <strong style={{ display: "block", marginTop: "6px" }}>Service not connected</strong>
              <small style={{ display: "block", color: "#fff", marginTop: "4px", fontSize: "11px" }}>
                {errorMessage || "Backend service is not connected yet."}
              </small>
            </div>
          )}
          {state === "scanned" && scannedData && (
            <div className="scan-success" style={{ textAlign: "center", color: "#fff" }}>
              <Icon name="check" size={36} />
              <strong>ID scanned successfully!</strong>
              <small style={{ display: "block", color: "#d1fae5", marginTop: "4px" }}>
                {scannedData.name} · {maskIdNumber(scannedData.idNumber)}
              </small>
            </div>
          )}
        </div>
      </div>
      <div className="camera-sheet">
        <label className="consent">
          <input type="checkbox" defaultChecked />
          <span>
            <Icon name="check" size={14} />
          </span>
          <p>The tenant agrees to have their ID read for this contract.</p>
        </label>
        <Banner tone="info" icon="shield">
          The photo is used only to read the details and is never saved.
        </Banner>
        {state === "scanned" ? (
          <>
            <Button onClick={applyScanned}>Use scanned details</Button>
            <Button variant="ghost" onClick={() => setState("ready")}>
              Scan another ID
            </Button>
          </>
        ) : state === "error" ? (
          <>
            <Button icon="camera" onClick={triggerScanOrUpload}>
              Try another photo
            </Button>
            <Button variant="ghost" onClick={() => go(5)}>
              Type details manually instead
            </Button>
          </>
        ) : (
          <>
            <Button icon="camera" onClick={triggerScanOrUpload} disabled={state === "loading"}>
              {state === "loading" ? "Reading…" : "Choose or Take ID Photo"}
            </Button>
            <Button variant="ghost" onClick={() => go(5)}>
              Type details manually instead
            </Button>
          </>
        )}
      </div>
    </main>
  )
}
