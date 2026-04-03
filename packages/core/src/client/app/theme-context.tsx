import { createContext, use, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark')
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage and set internal resolved theme
  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('boltdocs-theme') as Theme | null
    const initialTheme = (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'system'
    
    setThemeState(initialTheme)

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const updateResolved = (currentTheme: Theme, isDark: boolean) => {
      if (currentTheme === 'system') {
        setResolvedTheme(isDark ? 'dark' : 'light')
      } else {
        setResolvedTheme(currentTheme as 'light' | 'dark')
      }
    }

    updateResolved(initialTheme, mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      // Re-read current theme state from some stable ref would be better, but we can capture it
      // actually, the second useEffect will handle the source of truth, 
      // but this listener ensures 'system' updates instantly.
      setResolvedTheme((prevResolved) => {
        const currentTheme = localStorage.getItem('boltdocs-theme') as Theme || 'system'
        if (currentTheme === 'system') {
          return e.matches ? 'dark' : 'light'
        }
        return prevResolved
      })
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Sync with DOM and resolved theme when theme preference changes
  useEffect(() => {
    if (!mounted) return

    const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const nextResolved = theme === 'system' ? (isSystemDark ? 'dark' : 'light') : theme

    setResolvedTheme(nextResolved as 'light' | 'dark')

    const root = document.documentElement
    if (nextResolved === 'light') {
      root.classList.add('theme-light')
      root.dataset.theme = 'light'
    } else {
      root.classList.remove('theme-light')
      root.dataset.theme = 'dark'
    }
  }, [theme, mounted])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('boltdocs-theme', newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = use(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
