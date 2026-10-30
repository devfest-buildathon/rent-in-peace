import { useState } from "react"

export function useLocalStorage<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (val: T | ((prev: T) => T)) => {
    try {
      const valueToStore = val instanceof Function ? val(storedValue) : val
      setStoredValue(valueToStore)
      localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (e) {
      console.error(`Error saving to localStorage key "${key}":`, e)
    }
  }

  return [storedValue, setValue]
}
