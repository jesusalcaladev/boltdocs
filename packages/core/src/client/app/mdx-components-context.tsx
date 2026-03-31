import React, { createContext, useContext } from 'react'

export type MdxComponentsType = Record<string, React.ComponentType<any>>

const MdxComponentsContext = createContext<MdxComponentsType>({})

export function useMdxComponents() {
  return useContext(MdxComponentsContext)
}

export function MdxComponentsProvider({
  components,
  children,
}: {
  components: MdxComponentsType
  children: React.ReactNode
}) {
  return (
    <MdxComponentsContext.Provider value={components}>
      {children}
    </MdxComponentsContext.Provider>
  )
}
