import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface BoltdocsState {
  currentLocale: string | undefined
  currentVersion: string | undefined
  hasHydrated: boolean

  // Actions
  setLocale: (locale: string | undefined) => void
  setVersion: (version: string | undefined) => void
  setHasHydrated: (val: boolean) => void
}

/**
 * Global store for Boltdocs documentation state.
 * Uses localStorage persistence to remember user preferences across sessions.
 */
export const useBoltdocsStore = create<BoltdocsState>()(
  persist(
    (set) => ({
      currentLocale: undefined,
      currentVersion: undefined,
      hasHydrated: false,

      setLocale: (locale: string | undefined) => set({ currentLocale: locale }),
      setVersion: (version: string | undefined) =>
        set({ currentVersion: version }),
      setHasHydrated: (val: boolean) => set({ hasHydrated: val }),
    }),
    {
      name: 'boltdocs-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist identifying state
      partialize: (state: BoltdocsState) => ({
        currentLocale: state.currentLocale,
        currentVersion: state.currentVersion,
      }),
      onRehydrateStorage: () => (state?: BoltdocsState) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
