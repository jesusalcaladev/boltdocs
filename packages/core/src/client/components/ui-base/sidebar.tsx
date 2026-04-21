import { useState, useEffect, useMemo } from 'react'
import { useSidebar } from '../../hooks/use-sidebar'
import { Sidebar as SidebarPrimitive } from '../primitives/sidebar'
import { PoweredBy } from './powered-by'
import * as LucideIcons from 'lucide-react'
import type { ComponentRoute } from '../../types'
import type { BoltdocsConfig } from '../../../node/config'

function getIcon(iconName?: string): React.ElementType | undefined {
  if (!iconName) return undefined
  const icons = LucideIcons as unknown as Record<string, React.ElementType>
  const IconComponent = icons[iconName]
  return IconComponent || undefined
}

function SidebarSubRouteGroup({
  route,
  activePath,
  getIcon,
}: {
  route: ComponentRoute
  activePath: string
  getIcon: (iconName?: string) => React.ElementType | undefined
}) {
  const isCurrent =
    activePath ===
    (route.path.endsWith('/') ? route.path.slice(0, -1) : route.path)

  const hasActiveSubRoute = useMemo(
    () => route.subRoutes?.some((r) => r.path === activePath),
    [route.subRoutes, activePath],
  )

  const [isOpen, setIsOpen] = useState(hasActiveSubRoute || isCurrent)

  useEffect(() => {
    if (hasActiveSubRoute || isCurrent) {
      setIsOpen(true)
    }
  }, [hasActiveSubRoute, isCurrent])

  return (
    <SidebarPrimitive.SubGroup
      label={route.title}
      href={route.path}
      active={isCurrent}
      icon={getIcon(route.icon)}
      badge={route.badge}
      isOpen={isOpen}
      onToggle={() => setIsOpen(!isOpen)}
    >
      {route.subRoutes?.map((subRoute: ComponentRoute) => {
        const isSubCurrent =
          activePath ===
          (subRoute.path.endsWith('/') ? subRoute.path.slice(0, -1) : subRoute.path)
        return (
          <SidebarPrimitive.Link
            key={subRoute.path}
            label={subRoute.title}
            href={subRoute.path}
            active={isSubCurrent}
            icon={getIcon(subRoute.icon)}
            badge={subRoute.badge}
          />
        )
      })}
    </SidebarPrimitive.SubGroup>
  )
}

function SidebarGroupSection({
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
  return (
    <SidebarPrimitive.Group title={group.title} icon={getIcon(group.icon)}>
      {group.routes.map((route: ComponentRoute) => {
        if (route.subRoutes && route.subRoutes.length > 0) {
          return (
            <SidebarSubRouteGroup
              key={route.path}
              route={route}
              activePath={activePath}
              getIcon={getIcon}
            />
          )
        }

        const isCurrent =
          activePath ===
          (route.path.endsWith('/') ? route.path.slice(0, -1) : route.path)
        return (
          <SidebarPrimitive.Link
            key={route.path}
            label={route.title}
            href={route.path}
            active={isCurrent}
            icon={getIcon(route.icon)}
            badge={route.badge}
          />
        )
      })}
    </SidebarPrimitive.Group>
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
  const themeConfig = config.theme || {}

  return (
    <SidebarPrimitive.Root>
      {ungrouped.length > 0 && (
        <SidebarPrimitive.Group className="mb-6">
          {ungrouped.map((route) => {
            const isCurrent =
              activePath ===
              (route.path.endsWith('/') ? route.path.slice(0, -1) : route.path)
            return (
              <SidebarPrimitive.Link
                key={route.path}
                label={route.title}
                href={route.path}
                active={isCurrent}
                icon={getIcon(route.icon)}
                badge={route.badge}
              />
            )
          })}
        </SidebarPrimitive.Group>
      )}

      {groups.map((group) => (
        <SidebarGroupSection
          key={group.slug}
          group={group}
          activePath={activePath}
          getIcon={getIcon}
        />
      ))}

      {themeConfig?.poweredBy && (
        <div className="mt-auto pt-8">
          <PoweredBy />
        </div>
      )}
    </SidebarPrimitive.Root>
  )
}
