import { useState, useCallback, useRef } from "react"

export interface NoticeState {
  text: string
  tone?: "success" | "error"
}

export function useNotice() {
  const [notice, setNotice] = useState<NoticeState | null>(null)
  const timerRef = useRef<number | null>(null)

  const notify = useCallback(
    (message: string, tone: "success" | "error" = "success") => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
      setNotice({ text: message, tone })
      timerRef.current = window.setTimeout(() => {
        setNotice(null)
      }, 3000)
    },
    []
  )

  return { notice, notify }
}
