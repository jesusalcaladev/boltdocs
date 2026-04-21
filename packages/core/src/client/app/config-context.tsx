import { createContext, use } from 'react'
import type { BoltdocsConfig } from '../../node/config'

/**
 * Context for the global documentation configuration.
 * Using a global singleton pattern to survive dual-package or duplicated-code hazards.
 */
const CONFIG_CONTEXT_SYMBOL = Symbol.for('__BDOCS_CONFIG_CONTEXT__')
const CONFIG_INSTANCE_SYMBOL = Symbol.for('__BDOCS_CONFIG_INSTANCE__')

export const ConfigContext =
  (globalThis as any)[CONFIG_CONTEXT_SYMBOL] ||
  ((globalThis as any)[CONFIG_CONTEXT_SYMBOL] =
    createContext<BoltdocsConfig | null>(null))

export function ConfigProvider({
  config,
  children,
}: {
  config: BoltdocsConfig
  children: React.ReactNode
}) {
  // Sync with global registry for dual-package fallback
  if (typeof globalThis !== 'undefined') {
    ;(globalThis as any)[CONFIG_INSTANCE_SYMBOL] = config
  }

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  )
}

/**
 * Hook to access the Boltdocs configuration.
 */
export function useConfig() {
  const context = use(ConfigContext)

  // Fallback to global registry if context is missing (dual-package hazard safety net)
  if (
    !context &&
    typeof globalThis !== 'undefined' &&
    (globalThis as any)[CONFIG_INSTANCE_SYMBOL]
  ) {
    return (globalThis as any)[CONFIG_INSTANCE_SYMBOL] as BoltdocsConfig
  }

  if (!context)
    throw new Error('useConfig must be used within a ConfigProvider')
  return context as BoltdocsConfig
}
