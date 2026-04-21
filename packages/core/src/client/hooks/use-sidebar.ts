import { useLocation } from 'react-router-dom'
import { useConfig } from '../app/config-context'
import type { ComponentRoute } from '../types'

export function useSidebar(routes: ComponentRoute[]) {
  const config = useConfig()
  const location = useLocation()

  // Find active route and tab
  const normalize = (p: string) =>
    p.endsWith('/') && p.length > 1 ? p.slice(0, -1) : p
  const currentPath = normalize(location.pathname)

  const activeRoute = routes.find((r) => normalize(r.path) === currentPath)
  const activeTabId = activeRoute?.tab?.toLowerCase()

  // Filter routes by active tab if any
  const filteredRoutes = activeTabId
    ? routes.filter((r) => !r.tab || r.tab.toLowerCase() === activeTabId)
    : routes

  const ungrouped: ComponentRoute[] = []
  const groupsMap = new Map<
    string,
    { slug: string; title: string; routes: ComponentRoute[]; icon?: string }
  >()

  for (const route of filteredRoutes) {
    if (!route.group) {
      ungrouped.push(route)
    } else {
      if (!groupsMap.has(route.group)) {
        groupsMap.set(route.group, {
          slug: route.group,
          title: route.groupTitle || route.group,
          routes: [],
          icon: route.groupIcon,
        })
      }
      groupsMap.get(route.group)!.routes.push(route)
    }
  }

  const groups = Array.from(groupsMap.values()).map((group) => {
    const subRouteParents = new Map<string, ComponentRoute>()
    const subRouteChildren = new Map<string, ComponentRoute[]>()

    // First pass: Categorize as parent or child
    for (const route of group.routes) {
      if (route.subRouteGroup) {
        const isParent =
          route.path.endsWith(`/${route.subRouteGroup}`) ||
          route.path.endsWith(`/${route.subRouteGroup}/`)

        if (isParent && !subRouteParents.has(route.subRouteGroup)) {
          subRouteParents.set(route.subRouteGroup, route)
        } else {
          if (!subRouteChildren.has(route.subRouteGroup)) {
            subRouteChildren.set(route.subRouteGroup, [])
          }
          subRouteChildren.get(route.subRouteGroup)!.push(route)
        }
      }
    }

    const finalRoutes: ComponentRoute[] = []
    const seenSubGroups = new Set<string>()

    // Second pass: Assemble maintaining mostly original order
    for (const route of group.routes) {
      if (route.subRouteGroup) {
        if (!seenSubGroups.has(route.subRouteGroup)) {
          seenSubGroups.add(route.subRouteGroup)
          const parent = subRouteParents.get(route.subRouteGroup)
          const children = subRouteChildren.get(route.subRouteGroup) || []

          if (parent) {
            finalRoutes.push({ ...parent, subRoutes: children })
          } else {
            // Fallback
            finalRoutes.push(...children)
          }
        }
      } else {
        finalRoutes.push(route)
      }
    }

    return { ...group, routes: finalRoutes }
  })

  return {
    groups,
    ungrouped,
    activeRoute,
    activePath: currentPath,
    config,
  }
}
