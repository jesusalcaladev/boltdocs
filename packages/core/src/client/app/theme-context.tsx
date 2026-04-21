import { createContext, use, useState, useEffect } from 'react'

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const THEME_CONTEXT_SYMBOL = Symbol.for('__BDOCS_THEME_CONTEXT__')
const THEME_INSTANCE_SYMBOL = Symbol.for('__BDOCS_THEME_INSTANCE__')

const ThemeContext =
  (globalThis as any)[THEME_CONTEXT_SYMBOL] ||
  ((globalThis as any)[THEME_CONTEXT_SYMBOL] = createContext<
    ThemeContextType | undefined
  >(undefined))

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark')
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage and set internal resolved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('boltdocs-theme') as Theme | null
    const initialTheme = savedTheme || 'system'
    setThemeState(initialTheme)

    const root = window.document.documentElement
    const isDark =
      initialTheme === 'dark' ||
      (initialTheme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    root.classList.toggle('dark', isDark)
    setResolvedTheme(isDark ? 'dark' : 'light')
    setMounted(true)
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('boltdocs-theme', newTheme)

    const root = window.document.documentElement
    const isDark =
      newTheme === 'dark' ||
      (newTheme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    root.classList.toggle('dark', isDark)
    setResolvedTheme(isDark ? 'dark' : 'light')
  }

  const value = { theme, resolvedTheme, setTheme }

  // Sync with global registry
  if (typeof globalThis !== 'undefined') {
    ;(globalThis as any)[THEME_INSTANCE_SYMBOL] = value
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = use(ThemeContext)

  // Fallback to global registry for dual-package hazards
  if (
    !context &&
    typeof globalThis !== 'undefined' &&
    (globalThis as any)[THEME_INSTANCE_SYMBOL]
  ) {
    return (globalThis as any)[THEME_INSTANCE_SYMBOL] as ThemeContextType
  }

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
