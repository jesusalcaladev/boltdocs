import { useState, useEffect, useMemo } from 'react'
import { useSidebar } from '@hooks/use-sidebar'
import SidebarPrimitive from '@components/primitives/sidebar'
import { PoweredBy } from './powered-by'
import * as LucideIcons from 'lucide-react'
import type { ComponentRoute } from '@client/types'
import type { BoltdocsConfig } from '@node/config'

function getIcon(iconName?: string): React.ElementType | undefined {
  if (!iconName) return undefined
  const IconComponent = (LucideIcons as Record<string, any>)[iconName]
  return IconComponent || undefined
}

function CollapsibleSidebarGroup({
  group,
  activePath,
  getIcon,
}: {
  group: {
    slug: string
    title: string
    routes: ComponentRoute[]
    icon?: string
  }
  activePath: string
  getIcon: (iconName?: string) => React.ElementType | undefined
}) {
  const hasActiveRoute = useMemo(
    () => group.routes.some((r) => r.path === activePath),
    [group.routes, activePath],
  )

  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    if (hasActiveRoute) {
      setIsOpen(true)
    }
  }, [hasActiveRoute])

  return (
    <SidebarPrimitive.SidebarGroup
      title={group.title}
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
    >
      {group.routes.map((route: ComponentRoute) => (
        <SidebarPrimitive.SidebarLink
          key={route.path}
          label={route.title}
          href={route.path}
          active={activePath === route.path}
          icon={getIcon(route.icon)}
          badge={route.badge}
        />
      ))}
    </SidebarPrimitive.SidebarGroup>
  )
}

export function Sidebar({
  routes,
  config,
}: {
  routes: ComponentRoute[]
  config: BoltdocsConfig
}) {
  const { groups, ungrouped, activePath } = useSidebar(routes)

  return (
    <SidebarPrimitive.SidebarRoot>
      {ungrouped.length > 0 && (
        <SidebarPrimitive.SidebarGroup className="mb-6">
          {ungrouped.map((route) => (
            <SidebarPrimitive.SidebarLink
              key={route.path}
              label={route.title}
              href={route.path}
              active={activePath === route.path}
              icon={getIcon(route.icon)}
              badge={route.badge}
            />
          ))}
        </SidebarPrimitive.SidebarGroup>
      )}

      {groups.map((group) => (
        <CollapsibleSidebarGroup
          key={group.slug}
          group={group}
          activePath={activePath}
          getIcon={getIcon}
        />
      ))}

      {config.themeConfig?.poweredBy && (
        <div className="mt-auto pt-8">
          <PoweredBy />
        </div>
      )}
    </SidebarPrimitive.SidebarRoot>
  )
}
