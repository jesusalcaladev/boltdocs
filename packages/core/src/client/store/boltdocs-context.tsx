import { createContext, use, useMemo, useState } from 'react'

export interface BoltdocsState {
  currentLocale: string
  currentVersion: string
  setLocale: (locale: string) => void
  setVersion: (version: string) => void
  hasHydrated: boolean
  setHasHydrated: (hasHydrated: boolean) => void
}

const BOLTDOCS_CONTEXT_SYMBOL = Symbol.for('__BDOCS_BOLTDOCS_CONTEXT__')
const BOLTDOCS_INSTANCE_SYMBOL = Symbol.for('__BDOCS_BOLTDOCS_INSTANCE__')

const BoltdocsContext =
  (globalThis as any)[BOLTDOCS_CONTEXT_SYMBOL] ||
  ((globalThis as any)[BOLTDOCS_CONTEXT_SYMBOL] = createContext<
    BoltdocsState | undefined
  >(undefined))

export function BoltdocsProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState('')
  const [version, setVersion] = useState('')
  const [hasHydrated, setHasHydrated] = useState(false)

  const value = useMemo(
    () => ({
      currentLocale: locale,
      currentVersion: version,
      setLocale,
      setVersion,
      hasHydrated,
      setHasHydrated,
    }),
    [locale, version, hasHydrated],
  )

  // Sync with global registry for dual-package fallback
  if (typeof globalThis !== 'undefined') {
    ;(globalThis as any)[BOLTDOCS_INSTANCE_SYMBOL] = value
  }

  return (
    <BoltdocsContext.Provider value={value}>
      {children}
    </BoltdocsContext.Provider>
  )
}

export function useBoltdocsContext() {
  const context = use(BoltdocsContext)

  // Fallback to global registry if context is missing (dual-package hazard safety net)
  if (
    !context &&
    typeof globalThis !== 'undefined' &&
    (globalThis as any)[BOLTDOCS_INSTANCE_SYMBOL]
  ) {
    return (globalThis as any)[BOLTDOCS_INSTANCE_SYMBOL] as BoltdocsState
  }

  if (!context) {
    throw new Error('useBoltdocsContext must be used within a BoltdocsProvider')
  }
  return context as BoltdocsState
}
