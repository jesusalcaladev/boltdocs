import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

interface BoltdocsState {
  currentLocale: string | undefined
  currentVersion: string | undefined
  hasHydrated: boolean

  // Actions
  setLocale: (locale: string | undefined) => void
  setVersion: (version: string | undefined) => void
  setHasHydrated: (val: boolean) => void
}

interface BoltdocsContextValue extends BoltdocsState {}

const BoltdocsContext = createContext<BoltdocsContextValue | undefined>(undefined)

const STORAGE_KEY = 'boltdocs-storage'

/**
 * Load persisted state from localStorage
 */
function loadPersistedState(): Partial<BoltdocsState> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // zustand persist stores the entire state object under a "state" key
      return parsed?.state || parsed
    }
  } catch (e) {
    // ignore parse errors
  }
  return {}
}

/**
 * Provider component that wraps the app and manages state
 */
export function BoltdocsProvider({ children }: { children: React.ReactNode }) {
  const persisted = loadPersistedState()

  const [currentLocale, setCurrentLocale] = useState<string | undefined>(
    persisted.currentLocale
  )
  const [currentVersion, setCurrentVersion] = useState<string | undefined>(
    persisted.currentVersion
  )
  const [hasHydrated, setHasHydrated] = useState(false)

  // Mark as hydrated after initial load
  useEffect(() => {
    setHasHydrated(true)
  }, [])

  // Persist state changes to localStorage
  useEffect(() => {
    if (hasHydrated) {
      const stateToPersist = {
        currentLocale,
        currentVersion,
      }
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ state: stateToPersist })
        )
      } catch (e) {
        // ignore storage errors
      }
    }
  }, [currentLocale, currentVersion, hasHydrated])

  const setLocale = useCallback((locale: string | undefined) => {
    setCurrentLocale(locale)
  }, [])

  const setVersion = useCallback((version: string | undefined) => {
    setCurrentVersion(version)
  }, [])

  const setHasHydratedAction = useCallback((val: boolean) => {
    setHasHydrated(val)
  }, [])

  const value: BoltdocsContextValue = {
    currentLocale,
    currentVersion,
    hasHydrated,
    setLocale,
    setVersion,
    setHasHydrated: setHasHydratedAction,
  }

  return (
    <BoltdocsContext.Provider value={value}>{children}</BoltdocsContext.Provider>
  )
}

/**
 * Hook to access the Boltdocs context.
 * Must be used within a BoltdocsProvider.
 */
export function useBoltdocsContext(): BoltdocsContextValue {
  const context = useContext(BoltdocsContext)
  if (!context) {
    throw new Error('useBoltdocsContext must be used within a BoltdocsProvider')
  }
  return context
}

/**
 * Backwards-compatible hook that mimics the Zustand store API.
 * Accepts a selector function and returns the selected value.
 */
export function useBoltdocsStore<T>(selector: (state: BoltdocsState) => T): T {
  const context = useBoltdocsContext()
  return selector(context)
}
