import { useEffect, useState } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@client/app/theme-context'
import { Button } from 'react-aria-components'
import { Menu } from '@components/primitives/menu'

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
    <Menu.Trigger placement="bottom right">
      <Button
        className="flex h-9 w-9 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-bg-surface hover:text-text-main outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-label="Selection theme"
      >
        <Icon size={20} className="animate-in fade-in zoom-in duration-300" />
      </Button>
      <Menu.Root
        selectionMode="single"
        selectedKeys={[theme]}
        onSelectionChange={(keys) => {
          const newTheme = Array.from(keys)[0] as 'light' | 'dark' | 'system'
          setTheme(newTheme)
        }}
      >
        <Menu.Item id="light">
          <Sun size={16} />
          <span>Light</span>
        </Menu.Item>
        <Menu.Item id="dark">
          <Moon size={16} />
          <span>Dark</span>
        </Menu.Item>
        <Menu.Item id="system">
          <Monitor size={16} />
          <span>System</span>
        </Menu.Item>
      </Menu.Root>
    </Menu.Trigger>
  )
}
