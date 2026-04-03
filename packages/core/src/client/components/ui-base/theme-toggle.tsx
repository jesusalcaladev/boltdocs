import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@client/app/theme-context'
import { Button } from 'react-aria-components'
import { Menu, MenuItem, MenuTrigger } from '@components/primitives/menu'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-9 w-9" />
  }

  const Icon = theme === 'system' ? Monitor : theme === 'dark' ? Moon : Sun

  return (
    <MenuTrigger placement="bottom right">
      <Button
        className="flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-bg-surface hover:text-text-main outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-label="Selection theme"
      >
        <Icon size={20} className="animate-in fade-in zoom-in duration-300" />
      </Button>
      <Menu
        selectionMode="single"
        selectedKeys={[theme]}
        onSelectionChange={(keys) => {
          const newTheme = Array.from(keys)[0] as 'light' | 'dark' | 'system'
          setTheme(newTheme)
        }}
      >
        <MenuItem id="light">
          <Sun size={16} />
          <span>Light</span>
        </MenuItem>
        <MenuItem id="dark">
          <Moon size={16} />
          <span>Dark</span>
        </MenuItem>
        <MenuItem id="system">
          <Monitor size={16} />
          <span>System</span>
        </MenuItem>
      </Menu>
    </MenuTrigger>
  )
}
