import { useLocation } from 'react-router-dom'
import { useConfig } from '@client/app/config-context'
import type { ComponentRoute } from '../types'

export function useSidebar(routes: ComponentRoute[]) {
  const config = useConfig()
  const location = useLocation()

  // Find active route and tab
  const activeRoute = routes.find((r) => r.path === location.pathname)
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

  const groups = Array.from(groupsMap.values())

  return {
    groups,
    ungrouped,
    activeRoute,
    activePath: location.pathname,
    config,
  }
}
