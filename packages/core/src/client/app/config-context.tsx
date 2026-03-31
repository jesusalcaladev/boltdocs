import { createContext, use } from 'react'
import type { BoltdocsConfig } from '@node/config'

/**
 * Context for the global documentation configuration.
 */
export const ConfigContext = createContext<BoltdocsConfig | null>(null)

/**
 * Hook to access the Boltdocs configuration.
 */
export function useConfig() {
  const context = use(ConfigContext)
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }
  return context
}
