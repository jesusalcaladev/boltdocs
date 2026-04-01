import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@client/app/theme-context'
import { ToggleButton } from 'react-aria-components'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-9 w-9" />
  }

  return (
    <ToggleButton
      onChange={toggleTheme}
      className="flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-bg-surface hover:text-text-main"
      aria-label="Toggle theme"
      isSelected={theme === 'dark'}
    >
      {theme === 'dark' ? (
        <Sun size={20} className="animate-in fade-in zoom-in duration-300" />
      ) : (
        <Moon size={20} className="animate-in fade-in zoom-in duration-300" />
      )}
    </ToggleButton>
  )
}
