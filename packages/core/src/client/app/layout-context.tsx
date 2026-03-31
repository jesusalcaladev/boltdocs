import { createContext, use } from 'react'
import type { LayoutConfig } from '../types'

const LayoutContext = createContext<LayoutConfig>({})

export function useLayout() {
  return use(LayoutContext)
}

export function LayoutProvider({
  config = {},
  children,
}: {
  config?: LayoutConfig
  children: React.ReactNode
}) {
  return (
    <LayoutContext.Provider value={config}>{children}</LayoutContext.Provider>
  )
}
