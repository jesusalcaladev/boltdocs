import { createContext, use } from 'react'

export type MdxComponentsType = Record<string, React.ComponentType<any>>

const MDX_COMPONENTS_CONTEXT_SYMBOL = Symbol.for(
  '__BDOCS_MDX_COMPONENTS_CONTEXT__',
)
const MDX_COMPONENTS_INSTANCE_SYMBOL = Symbol.for(
  '__BDOCS_MDX_COMPONENTS_INSTANCE__',
)

const MdxComponentsContext =
  (globalThis as any)[MDX_COMPONENTS_CONTEXT_SYMBOL] ||
  ((globalThis as any)[MDX_COMPONENTS_CONTEXT_SYMBOL] =
    createContext<MdxComponentsType>({}))

export function useMdxComponents() {
  const context = use(MdxComponentsContext)

  // Fallback to global registry for dual-package hazards
  if (
    (!context || Object.keys(context).length === 0) &&
    (globalThis as any)[MDX_COMPONENTS_INSTANCE_SYMBOL]
  ) {
    return (globalThis as any)[MDX_COMPONENTS_INSTANCE_SYMBOL]
  }

  return context
}

export function MdxComponentsProvider({
  components,
  children,
}: {
  components: MdxComponentsType
  children: React.ReactNode
}) {
  // Sync with global registry
  if (typeof globalThis !== 'undefined') {
    ;(globalThis as any)[MDX_COMPONENTS_INSTANCE_SYMBOL] = components
  }

  return (
    <MdxComponentsContext.Provider value={components}>
      {children}
    </MdxComponentsContext.Provider>
  )
}
