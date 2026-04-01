import { createContext, use, useCallback, useRef } from 'react'
import type { ComponentRoute } from '../types'

interface PreloadContextType {
  preload: (path: string) => void
  routes: ComponentRoute[]
}

const PreloadContext = createContext<PreloadContextType>({
  preload: () => {},
  routes: [],
})

export function usePreload() {
  return use(PreloadContext)
}

export function PreloadProvider({
  routes,
  modules,
  children,
}: {
  routes: ComponentRoute[]
  modules: Record<string, () => Promise<unknown>>
  children: React.ReactNode
}) {
  const preloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const preload = useCallback(
    (path: string) => {
      if (preloadTimerRef.current) {
        clearTimeout(preloadTimerRef.current)
      }

      preloadTimerRef.current = setTimeout(() => {
        // Normalize path (remove hash and search)
        const cleanPath = path.split('#')[0].split('?')[0]

        // Support index routes matching "/"
        const route = routes.find(
          (r) => r.path === cleanPath || (cleanPath === '/' && r.path === ''),
        )

        if (route?.filePath) {
          const loaderKey = Object.keys(modules).find((k) =>
            k.endsWith('/' + route.filePath),
          )

          if (loaderKey) {
            // Trigger the dynamic import
            modules[loaderKey]().catch((err: unknown) => {
              console.error(`[boltdocs] Failed to preload route ${path}:`, err)
            })
          }
        }
      }, 100) // 100ms debounce
    },
    [routes, modules],
  )

  return (
    <PreloadContext.Provider value={{ preload, routes }}>
      {children}
    </PreloadContext.Provider>
  )
}
